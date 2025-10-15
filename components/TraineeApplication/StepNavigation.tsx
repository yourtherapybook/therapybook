import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
  isLoading?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isValid,
  isLoading = false
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isFirstStep || isLoading
            ? 'text-neutral-400 cursor-not-allowed'
            : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2'
        }`}
        aria-label="Go to previous step"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Step Counter */}
      <div className="hidden sm:flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isActive ? 'bg-primary-500 scale-125' : 'bg-neutral-300'
              }`}
            />
          );
        })}
      </div>

      {/* Next/Submit Button */}
      <button
        onClick={onNext}
        disabled={!isValid || isLoading}
        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          !isValid || isLoading
            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md'
        }`}
        aria-label={isLastStep ? 'Submit application' : 'Go to next step'}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {isLastStep ? 'Submitting...' : 'Processing...'}
          </>
        ) : (
          <>
            {isLastStep ? 'Submit Application' : 'Next'}
            {!isLastStep && <ChevronRight className="w-5 h-5 ml-2" />}
          </>
        )}
      </button>
    </div>
  );
};

export default StepNavigation;