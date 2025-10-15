import React from 'react';
import { Check, User, MapPin, FileText, Shield } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick
}) => {
  const steps = [
    {
      number: 1,
      title: 'Account Information',
      description: 'Basic details and login credentials',
      icon: User
    },
    {
      number: 2,
      title: 'Office Location',
      description: 'Practice location and contact info',
      icon: MapPin
    },
    {
      number: 3,
      title: 'Public Profile',
      description: 'Professional qualifications and specialties',
      icon: FileText
    },
    {
      number: 4,
      title: 'Agreements & Submission',
      description: 'Terms, agreements, and final submission',
      icon: Shield
    }
  ];

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    } else if (stepNumber === currentStep) {
      return 'current';
    } else if (stepNumber < currentStep || completedSteps.includes(stepNumber - 1)) {
      return 'available';
    } else {
      return 'disabled';
    }
  };

  const getStepClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    const baseClasses = 'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-primary-500 border-primary-500 text-white`;
      case 'current':
        return `${baseClasses} bg-primary-50 border-primary-500 text-primary-600`;
      case 'available':
        return `${baseClasses} bg-white border-neutral-300 text-neutral-600 hover:border-primary-300 hover:text-primary-500 cursor-pointer`;
      case 'disabled':
      default:
        return `${baseClasses} bg-neutral-100 border-neutral-200 text-neutral-400`;
    }
  };

  const getConnectorClasses = (stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
    return `flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-primary-500' : 'bg-neutral-200'}`;
  };

  const canClickStep = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    return status === 'completed' || status === 'current' || status === 'available';
  };

  const handleStepClick = (stepNumber: number) => {
    if (canClickStep(stepNumber)) {
      onStepClick(stepNumber);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-neutral-600">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(step.number);
          const isCompleted = completedSteps.includes(step.number);
          
          return (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step.number)}
                  disabled={!canClickStep(step.number)}
                  className={`${getStepClasses(step.number)} ${
                    canClickStep(step.number) ? 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''
                  }`}
                  aria-label={`Go to ${step.title}`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
                
                {/* Step Info */}
                <div className="mt-3 text-center max-w-32">
                  <h3 className={`text-sm font-medium ${
                    status === 'current' ? 'text-primary-600' : 
                    status === 'completed' ? 'text-primary-500' : 
                    'text-neutral-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={getConnectorClasses(step.number)} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Title (Mobile) */}
      <div className="mt-6 text-center sm:hidden">
        <h2 className="text-lg font-semibold text-neutral-900">
          {steps[currentStep - 1]?.title}
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;