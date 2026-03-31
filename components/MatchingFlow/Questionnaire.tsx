"use client";
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { QuestionnaireStep } from '../../types';
import { QUESTIONNAIRE_STEPS } from '../../utils/constants';

interface QuestionnaireProps {
  onComplete: (answers: Record<string, string[]>) => void;
  crisisScreeningStep?: QuestionnaireStep;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, crisisScreeningStep }) => {
  const allSteps = useMemo(() => {
    return crisisScreeningStep
      ? [crisisScreeningStep, ...QUESTIONNAIRE_STEPS]
      : QUESTIONNAIRE_STEPS;
  }, [crisisScreeningStep]);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const currentQuestion = allSteps[currentStep];
  const isLastStep = currentStep === allSteps.length - 1;
  const currentAnswer = answers[currentQuestion.id] || [];

  const handleAnswerChange = (answer: string) => {
    if (currentQuestion.type === 'single') {
      setAnswers({ ...answers, [currentQuestion.id]: [answer] });
    } else {
      const newAnswers = currentAnswer.includes(answer)
        ? currentAnswer.filter(a => a !== answer)
        : [...currentAnswer, answer];
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(answers);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = currentAnswer.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">
            Step {currentStep + 1} of {allSteps.length}
          </span>
          <span className="text-sm text-neutral-500">
            {Math.round(((currentStep + 1) / allSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / allSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-subtle p-8 mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {currentQuestion.title}
        </h2>
        <p className="text-lg text-neutral-600 mb-8">
          {currentQuestion.question}
        </p>

        {/* Answer options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer.includes(option);
            return (
              <button
                key={index}
                onClick={() => handleAnswerChange(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option}</span>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {allSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary-500' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLastStep ? 'Get Results' : 'Next'}
          {!isLastStep && <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default Questionnaire;
