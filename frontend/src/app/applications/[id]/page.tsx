'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application, University, UniversityProgram } from '@/types/application';
import { ApplicationService } from '@/services/applicationService';
import { Loader2 } from 'lucide-react';
import { UniversityStep } from './components/UniversityStep';
import { AcademicStep } from './components/AcademicStep';
import { ActivitiesStep } from './components/ActivitiesStep';
import { EssaysStep } from './components/EssaysStep';
import { ResumeStep } from './components/ResumeStep';

interface ApplicationWithRelations extends Application {
  universities?: University;
  university_programs?: UniversityProgram;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type Step = 'university' | 'academic' | 'activities' | 'essays' | 'resume';

export default function ApplicationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('university');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ApplicationService.getApplication(resolvedParams.id);
      setApplication(data);
      setError(null);
    } catch (err) {
      setError('Failed to load application');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const steps: { key: Step; title: string }[] = [
    { key: 'university', title: 'University & Program' },
    { key: 'academic', title: 'Academic History' },
    { key: 'activities', title: 'Activities & Honors' },
    { key: 'essays', title: 'Essays' },
    { key: 'resume', title: 'Resume' },
  ];

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
  };

  const handleSave = async (data: Partial<Application>) => {
    try {
      const updated = await ApplicationService.updateApplication(resolvedParams.id, data);
      setApplication(updated);
      if (data.status === 'in_progress') {
        const nextStepIndex = steps.findIndex((step) => step.key === currentStep) + 1;
        if (nextStepIndex < steps.length) {
          handleStepChange(steps[nextStepIndex].key);
        }
      }
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">Application not found</p>
            <Button onClick={() => router.push('/applications')}>
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {application.universities?.name || 'New Application'}
        </h1>
        <div className="flex space-x-2">
          {steps.map((step) => (
            <Button
              key={step.key}
              variant={currentStep === step.key ? 'default' : 'outline'}
              onClick={() => handleStepChange(step.key)}
            >
              {step.title}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {steps.find((step) => step.key === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'university' && (
            <UniversityStep
              application={application}
              onSave={handleSave}
            />
          )}
          {currentStep === 'academic' && (
            <AcademicStep
              application={application}
              onSave={handleSave}
            />
          )}
          {currentStep === 'activities' && (
            <ActivitiesStep
              application={application}
              onSave={handleSave}
            />
          )}
          {currentStep === 'essays' && (
            <EssaysStep
              application={application}
              onSave={handleSave}
            />
          )}
          {currentStep === 'resume' && (
            <ResumeStep
              application={application}
              onSave={handleSave}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 