'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldValues, FieldErrors } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import Stepper from './stepper';

// Define a type for the form data based on the schema
interface OnboardingFormData {
  targetMajor: string;
  targetTerm?: string;
  college: string;
  undergradMajor?: string;
  cgpa?: string; // Numeric fields mapped to string for precision
  greQuantScore?: number;
  greVerbalScore?: number;
  greAwaScore?: string; // Numeric fields mapped to string for precision
  toeflScore?: number;
  ielts?: string;
  workExpMonths?: number;
  publications?: number;
}

const steps = [
  { id: 1, name: 'Basic Info', fields: ['targetMajor', 'targetTerm', 'college'] },
  { id: 2, name: 'Academic Info', fields: ['undergradMajor', 'cgpa'] },
  { id: 3, name: 'Test Scores', fields: ['greQuantScore', 'greVerbalScore', 'greAwaScore', 'toeflScore', 'ielts'] },
  { id: 4, name: 'Additional Info', fields: ['workExpMonths', 'publications'] },
];

export default function OnboardingForm({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    mode: 'onChange',
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key as keyof OnboardingFormData] = value;
        }
        return acc;
      }, {} as Partial<OnboardingFormData>);

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        console.error('Failed to update profile');
        alert('Failed to save profile. Please check the console for errors.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep - 1].fields as (keyof OnboardingFormData)[];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getErrorMessage = (field: keyof FieldErrors<OnboardingFormData>) => {
    const error = errors[field];
    return error ? String(error.message) : null;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <Stepper steps={steps.map(({id, name}) => ({id, name}))} currentStep={currentStep} />
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="text-lg font-semibold mb-6 text-center">{steps[currentStep - 1].name}</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="targetMajor">Target Major*</Label>
                <Input
                  id="targetMajor"
                  {...register('targetMajor', { required: 'Target major is required' })}
                  className="mt-1"
                  aria-invalid={errors.targetMajor ? "true" : "false"}
                />
                {errors.targetMajor && <p className="text-red-500 text-sm mt-1">{getErrorMessage('targetMajor')}</p>}
                <p className="text-sm text-gray-500 mt-1">E.g., Computer Science, Electrical Engineering</p>
              </div>
              <div>
                <Label htmlFor="targetTerm">Target Term</Label>
                <Input 
                    id="targetTerm" 
                    {...register('targetTerm')} 
                    className="mt-1" 
                    placeholder="e.g., Fall 2025"
                 />
                 <p className="text-sm text-gray-500 mt-1">Specify the semester and year you plan to start.</p>
              </div>
              <div>
                <Label htmlFor="college">Current College/University*</Label>
                <Input
                  id="college"
                  {...register('college', { required: 'College is required' })}
                  className="mt-1"
                  aria-invalid={errors.college ? "true" : "false"}
                />
                {errors.college && <p className="text-red-500 text-sm mt-1">{getErrorMessage('college')}</p>}
                <p className="text-sm text-gray-500 mt-1">The name of your current or most recent institution.</p>
              </div>
            </>
          )}
          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="undergradMajor">Undergraduate Major</Label>
                <Input id="undergradMajor" {...register('undergradMajor')} className="mt-1" />
                 <p className="text-sm text-gray-500 mt-1">Your major during your undergraduate studies.</p>
              </div>
              <div>
                <Label htmlFor="cgpa">CGPA</Label>
                <Input 
                    id="cgpa" 
                    type="text" 
                    {...register('cgpa', { 
                        pattern: { 
                            value: /^\d*\.?\d*$/, 
                            message: "Please enter a valid number for CGPA" 
                        }
                    })} 
                    className="mt-1" 
                    placeholder="e.g., 3.8 or 8.5"
                 />
                 {errors.cgpa && <p className="text-red-500 text-sm mt-1">{getErrorMessage('cgpa')}</p>}
                 <p className="text-sm text-gray-500 mt-1">Your Cumulative Grade Point Average. Specify scale if not 4.0 (e.g., 8.5/10).</p>
              </div>
            </>
          )}
          {currentStep === 3 && (
            <>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="greQuantScore">GRE Quant</Label>
                  <Input id="greQuantScore" type="number" {...register('greQuantScore', { valueAsNumber: true, min: 130, max: 170 })} className="mt-1" />
                   {errors.greQuantScore && <p className="text-red-500 text-sm mt-1">{getErrorMessage('greQuantScore') || 'Score must be 130-170'}</p>}
                </div>
                <div>
                  <Label htmlFor="greVerbalScore">GRE Verbal</Label>
                  <Input id="greVerbalScore" type="number" {...register('greVerbalScore', { valueAsNumber: true, min: 130, max: 170 })} className="mt-1" />
                  {errors.greVerbalScore && <p className="text-red-500 text-sm mt-1">{getErrorMessage('greVerbalScore') || 'Score must be 130-170'}</p>}
                </div>
                <div>
                  <Label htmlFor="greAwaScore">GRE AWA</Label>
                  <Input id="greAwaScore" type="text" {...register('greAwaScore', { pattern: { value: /^\d*\.?\d*$/, message: "Please enter a valid number" }})} className="mt-1" placeholder="e.g., 4.5"/>
                  {errors.greAwaScore && <p className="text-red-500 text-sm mt-1">{getErrorMessage('greAwaScore')}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="toeflScore">TOEFL Score</Label>
                <Input id="toeflScore" type="number" {...register('toeflScore', { valueAsNumber: true, min: 0, max: 120 })} className="mt-1" />
                {errors.toeflScore && <p className="text-red-500 text-sm mt-1">{getErrorMessage('toeflScore') || 'Score must be 0-120'}</p>}
              </div>
              <div>
                <Label htmlFor="ielts">IELTS Score</Label>
                <Input id="ielts" type="text" {...register('ielts', { pattern: { value: /^\d*\.?\d*$/, message: "Please enter a valid band score" }})} className="mt-1" placeholder="e.g., 7.5"/>
                {errors.ielts && <p className="text-red-500 text-sm mt-1">{getErrorMessage('ielts')}</p>}
              </div>
            </>
          )}
          {currentStep === 4 && (
            <>
              <div>
                <Label htmlFor="workExpMonths">Work Experience (Months)</Label>
                <Input id="workExpMonths" type="number" {...register('workExpMonths', { valueAsNumber: true, min: 0 })} className="mt-1" />
                 {errors.workExpMonths && <p className="text-red-500 text-sm mt-1">{getErrorMessage('workExpMonths')}</p>}
                 <p className="text-sm text-gray-500 mt-1">Enter your total relevant work experience in months.</p>
              </div>
              <div>
                <Label htmlFor="publications">Number of Publications</Label>
                <Input id="publications" type="number" {...register('publications', { valueAsNumber: true, min: 0 })} className="mt-1" />
                {errors.publications && <p className="text-red-500 text-sm mt-1">{getErrorMessage('publications')}</p>}
                 <p className="text-sm text-gray-500 mt-1">Enter the number of academic publications you have authored or co-authored.</p>
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}> 
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

