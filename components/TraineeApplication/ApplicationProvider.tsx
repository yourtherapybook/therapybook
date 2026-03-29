"use client";
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import {
  TraineeApplication,
  ApplicationContextType,
  ApplicationProviderProps,
  FormValidation,
  createEmptyApplication
} from '../../types/trainee-application';
import { validateStep, validateField, validateAllSteps } from '../../lib/validation';

// Action types for the reducer
type ApplicationAction =
  | { type: 'SET_APPLICATION'; payload: Partial<TraineeApplication> }
  | { type: 'UPDATE_APPLICATION'; payload: Partial<TraineeApplication> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_COMPLETED_STEPS'; payload: number[] }
  | { type: 'ADD_COMPLETED_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'RESET_APPLICATION' };

// Application state interface
interface ApplicationState {
  application: Partial<TraineeApplication>;
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  lastSaved?: Date;
}

// Initial state
const initialState: ApplicationState = {
  application: createEmptyApplication(),
  currentStep: 1,
  isLoading: false,
  isSaving: false,
  errors: {},
  lastSaved: undefined,
};

// Reducer function
const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
  switch (action.type) {
    case 'SET_APPLICATION':
      return {
        ...state,
        application: action.payload,
      };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        application: {
          ...state.application,
          ...action.payload,
        },
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_COMPLETED_STEPS':
      return {
        ...state,
        application: {
          ...state.application,
          completedSteps: action.payload,
        },
      };
    case 'ADD_COMPLETED_STEP':
      const currentCompleted = state.application.completedSteps || [];
      if (!currentCompleted.includes(action.payload)) {
        return {
          ...state,
          application: {
            ...state.application,
            completedSteps: [...currentCompleted, action.payload],
          },
        };
      }
      return state;
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };
    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
      };
    case 'RESET_APPLICATION':
      return {
        ...initialState,
        application: createEmptyApplication(),
      };
    default:
      return state;
  }
};

// Create the context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Debounce utility
const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Provider component
export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({
  children,
  initialData,
  applicationId,
}) => {
  const [state, dispatch] = useReducer(applicationReducer, {
    ...initialState,
    application: initialData || createEmptyApplication(),
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedApplicationId = applicationId || searchParams?.get('id') || undefined;
  const { user, isAuthenticated, register: registerUser } = useAuth();

  const buildUrl = useCallback((step: number, id?: string) => {
    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));
    current.set('step', step.toString());

    if (id) {
      current.set('id', id);
    }

    return `${pathname}?${current.toString()}`;
  }, [pathname, searchParams]);

  const buildAuthenticatedDraft = useCallback((): Partial<TraineeApplication> => ({
    ...createEmptyApplication(),
    accountInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      password: '',
      confirmPassword: '',
      requiresPassword: false,
    },
  }), [user]);

  const persistApplication = useCallback(async (
    snapshot: Partial<TraineeApplication>,
    id?: string
  ) => {
    const response = await fetch('/api/trainee/application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...snapshot,
        id,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Failed to save application');
    }

    return response.json();
  }, []);

  // Auto-save functionality with debouncing
  const performAutoSave = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      dispatch({ type: 'SET_SAVING', payload: true });

      const savedApplication = await persistApplication(
        state.application,
        resolvedApplicationId
      );

      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });

      if (!resolvedApplicationId && savedApplication.id) {
        router.replace(buildUrl(state.currentStep, savedApplication.id));
      }

    } catch (error) {
      console.error('Auto-save failed:', error);
      dispatch({
        type: 'SET_ERRORS',
        payload: {
          ...state.errors,
          autoSave: 'Failed to save progress automatically'
        }
      });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [buildUrl, isAuthenticated, persistApplication, resolvedApplicationId, router, state.application, state.currentStep, state.errors, user]);

  // Debounced auto-save (saves 2 seconds after last change)
  const debouncedAutoSave = useDebounce(performAutoSave, 2000);

  // Load application data
  const loadApplication = useCallback(async (id?: string) => {
    if (!isAuthenticated || !user) return;

    const loadId = id || resolvedApplicationId;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const endpoint = loadId
        ? `/api/trainee/application?id=${encodeURIComponent(loadId)}`
        : '/api/trainee/application';
      const response = await fetch(endpoint);

      if (response.ok) {
        const applicationData = await response.json();
        dispatch({ type: 'SET_APPLICATION', payload: applicationData });
        dispatch({ type: 'SET_CURRENT_STEP', payload: applicationData.currentStep || 1 });
      } else if (response.status === 404) {
        dispatch({ type: 'SET_APPLICATION', payload: buildAuthenticatedDraft() });
      } else {
        throw new Error('Failed to load application');
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      dispatch({
        type: 'SET_ERRORS',
        payload: {
          load: 'Failed to load application data'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [buildAuthenticatedDraft, isAuthenticated, resolvedApplicationId, user]);

  // Update application data
  const updateApplication = useCallback((data: Partial<TraineeApplication>) => {
    dispatch({ type: 'UPDATE_APPLICATION', payload: data });

    // Clear any previous errors for updated fields
    const updatedErrors = { ...state.errors };
    Object.keys(data).forEach(key => {
      delete updatedErrors[key];
    });
    dispatch({ type: 'SET_ERRORS', payload: updatedErrors });

    // Trigger auto-save
    debouncedAutoSave();
  }, [state.errors, debouncedAutoSave]);

  // Navigation functions
  const nextStep = useCallback(() => {
    const validation = validateStep(state.currentStep, state.application);

    if (!validation.isValid) {
      dispatch({ type: 'SET_ERRORS', payload: validation.errors });
      return;
    }

    const advanceStep = (savedApplicationId?: string) => {
      dispatch({ type: 'ADD_COMPLETED_STEP', payload: state.currentStep });

      if (state.currentStep < 4) {
        const newStep = state.currentStep + 1;
        dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
        dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: newStep } });
        router.push(buildUrl(newStep, savedApplicationId || resolvedApplicationId));
      }
    };

    const registerAndBindAccount = async () => {
      const accountInfo = state.application.accountInfo;
      if (!accountInfo) {
        dispatch({ type: 'SET_ERRORS', payload: { accountInfo: 'Account information is missing.' } });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERRORS', payload: {} });

        await registerUser({
          firstName: accountInfo.firstName,
          lastName: accountInfo.lastName,
          email: accountInfo.email,
          phone: accountInfo.phone || undefined,
          password: accountInfo.password,
        }, {
          autoLogin: true,
          callbackUrl: buildUrl(2),
        });

        const normalizedApplication: Partial<TraineeApplication> = {
          ...state.application,
          currentStep: 2,
          completedSteps: Array.from(new Set([...(state.application.completedSteps || []), 1])),
          accountInfo: {
            ...accountInfo,
            email: accountInfo.email.trim().toLowerCase(),
            password: '',
            confirmPassword: '',
            requiresPassword: false,
          },
        };

        dispatch({ type: 'SET_APPLICATION', payload: normalizedApplication });
        const savedApplication = await persistApplication(normalizedApplication, resolvedApplicationId);
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        advanceStep(savedApplication.id);
      } catch (error) {
        dispatch({
          type: 'SET_ERRORS',
          payload: {
            accountInfo: error instanceof Error ? error.message : 'Failed to create your account.',
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (state.currentStep === 1 && !isAuthenticated) {
      void registerAndBindAccount();
      return;
    }

    advanceStep();
  }, [buildUrl, isAuthenticated, persistApplication, registerUser, resolvedApplicationId, router, state.application, state.currentStep]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      const newStep = state.currentStep - 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: newStep } });
      router.push(buildUrl(newStep, resolvedApplicationId));
    }
  }, [buildUrl, resolvedApplicationId, router, state.currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      // Allow navigation to completed steps or the next step
      const completedSteps = state.application.completedSteps || [];
      if (completedSteps.includes(step) || step === state.currentStep || step === state.currentStep + 1) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
        dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: step } });
        router.push(buildUrl(step, resolvedApplicationId));
      }
    }
  }, [buildUrl, resolvedApplicationId, router, state.currentStep, state.application.completedSteps]);

  // Manual save function
  const saveProgress = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  // Submit application
  const submitApplication = useCallback(async () => {
    const validation = validateAllSteps(state.application);

    if (!validation.isValid) {
      dispatch({ type: 'SET_ERRORS', payload: validation.errors });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await persistApplication(
        {
          ...state.application,
          currentStep: 4,
          completedSteps: [1, 2, 3, 4],
        },
        resolvedApplicationId
      );

      const response = await fetch('/api/trainee/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.application,
          status: 'submitted',
          currentStep: 4,
          completedSteps: [1, 2, 3, 4],
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(
          errorPayload?.message ||
          errorPayload?.error ||
          'Failed to submit application'
        );
      }

      // Redirect to success page
      router.push('/trainee-application?success=true');

    } catch (error) {
      console.error('Failed to submit application:', error);
      dispatch({
        type: 'SET_ERRORS',
        payload: {
          submit: 'Failed to submit application. Please try again.'
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [persistApplication, resolvedApplicationId, router, state.application]);

  // Validation functions
  const validateStepFn = useCallback((step: number): FormValidation => {
    return validateStep(step, state.application);
  }, [state.application]);

  const validateFieldFn = useCallback((field: string, value: any): string | null => {
    return validateField(field, value, state.currentStep);
  }, [state.currentStep]);

  const validateAllStepsFn = useCallback((): FormValidation => {
    return validateAllSteps(state.application);
  }, [state.application]);

  // Load application on mount — guarded to run only once per authenticated user
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadApplication();
    }
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated, user, loadApplication]);

  // Handle URL step parameter
  useEffect(() => {
    const urlStep = parseInt(searchParams?.get('step') as string);
    if (urlStep && urlStep >= 1 && urlStep <= 4 && urlStep !== state.currentStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: urlStep });
    }
  }, [searchParams, state.currentStep]);

  // Context value
  const contextValue: ApplicationContextType = {
    application: state.application,
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    errors: state.errors,
    lastSaved: state.lastSaved,
    updateApplication,
    nextStep,
    previousStep,
    goToStep,
    submitApplication,
    saveProgress,
    loadApplication,
    validateStep: validateStepFn,
    validateField: validateFieldFn,
    validateAllSteps: validateAllStepsFn,
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};

// Custom hook to use the application context
export const useApplicationContext = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
};
