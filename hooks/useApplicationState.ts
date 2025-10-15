import { useCallback, useMemo } from 'react';
import { useApplicationContext } from '../components/TraineeApplication/ApplicationProvider';
import { TraineeApplication, FormValidation } from '../types/trainee-application';

/**
 * Custom hook that provides application state management functionality
 * This hook wraps the ApplicationContext and provides additional utilities
 */
export const useApplicationState = () => {
  const context = useApplicationContext();

  // Memoized computed values
  const computedValues = useMemo(() => {
    const { application, currentStep } = context;
    
    // Calculate completion percentage
    const completedSteps = application.completedSteps || [];
    const completionPercentage = Math.round((completedSteps.length / 4) * 100);
    
    // Check if current step is completed
    const isCurrentStepCompleted = completedSteps.includes(currentStep);
    
    // Check if application can be submitted
    const canSubmit = completedSteps.length === 4 && currentStep === 4;
    
    // Check if next step is available
    const canGoNext = currentStep < 4;
    
    // Check if previous step is available
    const canGoBack = currentStep > 1;
    
    // Get current step data
    const getCurrentStepData = () => {
      switch (currentStep) {
        case 1:
          return application.accountInfo;
        case 2:
          return application.officeLocation;
        case 3:
          return application.publicProfile;
        case 4:
          return application.agreements;
        default:
          return null;
      }
    };

    return {
      completionPercentage,
      isCurrentStepCompleted,
      canSubmit,
      canGoNext,
      canGoBack,
      currentStepData: getCurrentStepData(),
    };
  }, [context.application, context.currentStep]);

  // Enhanced update functions for specific sections
  const updateAccountInfo = useCallback((data: any) => {
    context.updateApplication({
      accountInfo: {
        ...context.application.accountInfo,
        ...data,
      },
    });
  }, [context]);

  const updateOfficeLocation = useCallback((data: any) => {
    context.updateApplication({
      officeLocation: {
        ...context.application.officeLocation,
        ...data,
      },
    });
  }, [context]);

  const updatePublicProfile = useCallback((data: any) => {
    context.updateApplication({
      publicProfile: {
        ...context.application.publicProfile,
        ...data,
      },
    });
  }, [context]);

  const updateAgreements = useCallback((data: any) => {
    context.updateApplication({
      agreements: {
        ...context.application.agreements,
        ...data,
      },
    });
  }, [context]);

  // Validation helpers
  const validateCurrentStep = useCallback((): FormValidation => {
    return context.validateStep(context.currentStep);
  }, [context]);

  const getFieldError = useCallback((field: string): string | null => {
    return context.errors[field] || null;
  }, [context.errors]);

  const hasErrors = useMemo(() => {
    return Object.keys(context.errors).length > 0;
  }, [context.errors]);

  const clearErrors = useCallback(() => {
    // This would need to be implemented in the context
    // For now, we can clear errors by updating with empty errors
    context.updateApplication({});
  }, [context]);

  // Step navigation with validation
  const nextStepWithValidation = useCallback(async () => {
    const validation = validateCurrentStep();
    if (validation.isValid) {
      context.nextStep();
      return true;
    }
    return false;
  }, [context, validateCurrentStep]);

  // Auto-save status
  const autoSaveStatus = useMemo(() => {
    if (context.isSaving) {
      return 'saving';
    }
    if (context.lastSaved) {
      const timeSinceLastSave = Date.now() - context.lastSaved.getTime();
      if (timeSinceLastSave < 5000) { // Less than 5 seconds ago
        return 'saved';
      }
    }
    return 'idle';
  }, [context.isSaving, context.lastSaved]);

  // Form data helpers
  const getFormData = useCallback(() => {
    return {
      step1: context.application.accountInfo,
      step2: context.application.officeLocation,
      step3: context.application.publicProfile,
      step4: context.application.agreements,
    };
  }, [context.application]);

  const isStepValid = useCallback((step: number): boolean => {
    const validation = context.validateStep(step);
    return validation.isValid;
  }, [context]);

  const getStepErrors = useCallback((step: number): Record<string, string> => {
    const validation = context.validateStep(step);
    return validation.errors;
  }, [context]);

  // Progress tracking
  const getProgressInfo = useCallback(() => {
    const completedSteps = context.application.completedSteps || [];
    return {
      currentStep: context.currentStep,
      completedSteps,
      totalSteps: 4,
      completionPercentage: computedValues.completionPercentage,
      nextStep: context.currentStep < 4 ? context.currentStep + 1 : null,
      previousStep: context.currentStep > 1 ? context.currentStep - 1 : null,
    };
  }, [context.currentStep, context.application.completedSteps, computedValues.completionPercentage]);

  // Return all functionality
  return {
    // Core context values
    ...context,
    
    // Computed values
    ...computedValues,
    
    // Enhanced update functions
    updateAccountInfo,
    updateOfficeLocation,
    updatePublicProfile,
    updateAgreements,
    
    // Validation helpers
    validateCurrentStep,
    getFieldError,
    hasErrors,
    clearErrors,
    isStepValid,
    getStepErrors,
    
    // Navigation helpers
    nextStepWithValidation,
    
    // Auto-save status
    autoSaveStatus,
    
    // Form data helpers
    getFormData,
    getProgressInfo,
  };
};

// Type for the hook return value
export type ApplicationState = ReturnType<typeof useApplicationState>;