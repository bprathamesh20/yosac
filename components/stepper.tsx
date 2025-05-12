'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

interface Step {
  id: number;
  name: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <li key={step.name} className="flex-1">
            <div
              className={cn(
                'flex flex-col items-center text-center border-t-4 pt-2 md:pt-4',
                currentStep > index + 1 ? 'border-sky-600' :
                currentStep === index + 1 ? 'border-sky-600' : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div
                className={cn(
                  'relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                  currentStep > index + 1 ? 'border-sky-600 bg-sky-600 text-white' :
                  currentStep === index + 1 ? 'border-sky-600 text-sky-600' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                )}
              >
                {currentStep > index + 1 ? (
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <p 
                className={cn(
                    'mt-2 text-xs md:text-sm font-medium', 
                    currentStep >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {step.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 