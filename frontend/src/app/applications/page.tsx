'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Application, University, UniversityProgram } from '@/types/application';
import { ApplicationService } from '@/services/applicationService';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ApplicationWithRelations extends Application {
  universities?: University;
  university_programs?: UniversityProgram;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Store the intended destination
      sessionStorage.setItem('redirectTo', '/applications');
      router.replace('/login');
      return;
    }
    loadApplications();
  }, [user, authLoading]);

  const loadApplications = async () => {
    try {
      const data = await ApplicationService.getUserApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    if (!user) {
      // Store the intended destination
      sessionStorage.setItem('redirectTo', '/applications/new');
      router.replace('/login');
      return;
    }

    try {
      const newApplication = await ApplicationService.createApplication({});
      router.push(`/applications/application?id=${newApplication.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create application');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Applications</h1>
        <Button onClick={handleCreateApplication}>
          Create New Application
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No applications yet</p>
            <Button onClick={handleCreateApplication}>
              Create Your First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {application.universities?.name || 'University Not Selected'}
                    </CardTitle>
                    <CardDescription>
                      {application.university_programs?.choice_label || 'Program Not Selected'}
                    </CardDescription>
                  </div>
                  <Badge variant={application.status === 'draft' ? 'secondary' : 'default'}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add any additional application details here */}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => router.push(`/applications/application?id=${application.id}`)}
                >
                  View Application
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 