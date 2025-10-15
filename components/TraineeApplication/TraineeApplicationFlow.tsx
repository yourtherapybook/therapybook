import React from 'react';
import { ApplicationProvider } from './ApplicationProvider';
import { useApplicationState } from '../../hooks/useApplicationState';
import ProgressIndicator from './ProgressIndicator';
import StepNavigation from './StepNavigation';
import Step1AccountInfo from './Steps/Step1AccountInfo';
import Step2OfficeLocation from './Steps/Step2OfficeLocation';
import Step3PublicProfile from './Steps/Step3PublicProfile';
import Step4Agreements from './Steps/Step4Agreements';

// Auto-save status indicator component
const AutoSaveIndicator: React.FC = () => {
  const { autoSaveStatus, lastSaved } = useApplicationState();

  const getStatusText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'idle':
        return lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : '';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'text-yellow-600';
      case 'saved':
        return 'text-green-600';
      default:
        return 'text-neutral-500';
    }
  };

  if (autoSaveStatus === 'idle' && !lastSaved) return null;

  return (
    <div className={`text-sm ${getStatusColor()} flex items-center gap-2`}>
      {autoSaveStatus === 'saving' && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
      )}
      <span>{getStatusText()}</span>
    </div>
  );
};

// Main application flow component
const TraineeApplicationFlowContent: React.FC = () => {
  const {
    currentStep,
    application,
    isLoading,
    errors,
    updateApplication,
    nextStep,
    previousStep,
    goToStep,
    submitApplication,
    validateCurrentStep,
  } = useApplicationState();

  const completedSteps = application.completedSteps || [];

  const totalSteps = 4;

  // Render current step component
  const renderCurrentStep = () => {
    const validation = validateCurrentStep();
    
    const stepProps = {
      data: application,
      onUpdate: updateApplication,
      onNext: nextStep,
      onBack: previousStep,
      validation,
    };

    switch (currentStep) {
      case 1:
        return <Step1AccountInfo {...stepProps} />;
      case 2:
        return <Step2OfficeLocation {...stepProps} />;
      case 3:
        return <Step3PublicProfile {...stepProps} />;
      case 4:
        return <Step4Agreements {...stepProps} onSubmit={submitApplication} />;
      default:
        return <Step1AccountInfo {...stepProps} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Auto-save indicator */}
      <div className="flex justify-end mb-4">
        <AutoSaveIndicator />
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps || []}
        onStepClick={goToStep}
      />

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-subtle p-8 mt-8">
        {renderCurrentStep()}
      </div>

      {/* Step Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={previousStep}
        onNext={nextStep}
        isValid={validateCurrentStep().isValid}
        isLoading={isLoading}
      />

      {/* Global error display */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface TraineeApplicationFlowProps {
  initialStep?: number;
  applicationId?: string;
}

const TraineeApplicationFlow: React.FC<TraineeApplicationFlowProps> = ({ 
  initialStep = 1,
  applicationId 
}) => {
  return (
    <ApplicationProvider applicationId={applicationId}>
      <TraineeApplicationFlowContent />
    </ApplicationProvider>
  );
};

export default TraineeApplicationFlow;