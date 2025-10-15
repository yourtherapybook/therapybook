import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
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
  const { user, isAuthenticated } = useAuth();

  // Auto-save functionality with debouncing
  const performAutoSave = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      dispatch({ type: 'SET_SAVING', payload: true });

      const response = await fetch('/api/trainee/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.application,
          id: applicationId,
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save application');
      }

      const savedApplication = await response.json();
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      
      // Update application ID if it's a new application
      if (!applicationId && savedApplication.id) {
        router.replace({
          pathname: router.pathname,
          query: { ...router.query, id: savedApplication.id },
        }, undefined, { shallow: true });
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
  }, [state.application, applicationId, isAuthenticated, user, router, state.errors]);

  // Debounced auto-save (saves 2 seconds after last change)
  const debouncedAutoSave = useDebounce(performAutoSave, 2000);

  // Load application data
  const loadApplication = useCallback(async (id?: string) => {
    if (!isAuthenticated || !user) return;

    const loadId = id || applicationId;
    if (!loadId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch(`/api/trainee/application?id=${loadId}`);
      
      if (response.ok) {
        const applicationData = await response.json();
        dispatch({ type: 'SET_APPLICATION', payload: applicationData });
        dispatch({ type: 'SET_CURRENT_STEP', payload: applicationData.currentStep || 1 });
      } else if (response.status === 404) {
        // Application not found, start with empty application
        dispatch({ type: 'SET_APPLICATION', payload: createEmptyApplication() });
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
  }, [applicationId, isAuthenticated, user]);

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
    
    if (validation.isValid) {
      dispatch({ type: 'ADD_COMPLETED_STEP', payload: state.currentStep });
      
      if (state.currentStep < 4) {
        const newStep = state.currentStep + 1;
        dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
        dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: newStep } });
        
        // Update URL
        router.push({
          pathname: router.pathname,
          query: { ...router.query, step: newStep.toString() },
        }, undefined, { shallow: true });
      }
    } else {
      dispatch({ type: 'SET_ERRORS', payload: validation.errors });
    }
  }, [state.currentStep, state.application, router]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      const newStep = state.currentStep - 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: newStep } });
      
      // Update URL
      router.push({
        pathname: router.pathname,
        query: { ...router.query, step: newStep.toString() },
      }, undefined, { shallow: true });
    }
  }, [state.currentStep, router]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      // Allow navigation to completed steps or the next step
      const completedSteps = state.application.completedSteps || [];
      if (completedSteps.includes(step) || step === state.currentStep || step === state.currentStep + 1) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
        dispatch({ type: 'UPDATE_APPLICATION', payload: { currentStep: step } });
        
        // Update URL
        router.push({
          pathname: router.pathname,
          query: { ...router.query, step: step.toString() },
        }, undefined, { shallow: true });
      }
    }
  }, [state.currentStep, state.application.completedSteps, router]);

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

      const response = await fetch('/api/trainee/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...state.application,
          status: 'submitted',
          submittedAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      
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
  }, [state.application, router]);

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

  // Load application on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadApplication();
    }
  }, [isAuthenticated, user, loadApplication]);

  // Handle URL step parameter
  useEffect(() => {
    const urlStep = parseInt(router.query.step as string);
    if (urlStep && urlStep >= 1 && urlStep <= 4 && urlStep !== state.currentStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: urlStep });
    }
  }, [router.query.step, state.currentStep]);

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