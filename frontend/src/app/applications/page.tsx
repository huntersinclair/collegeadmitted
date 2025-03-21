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

interface ApplicationWithRelations extends Application {
  universities?: University;
  university_majors?: UniversityProgram;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCreateApplication = async () => {
    try {
      router.push('/applications/new');
    } catch (err) {
      setError('Failed to create application');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Button onClick={handleCreateApplication} className="bg-blue-600 hover:bg-blue-700">
          Create New Application
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Couldn&apos;t load applications. Please try again.
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">You haven&apos;t created any applications yet.</p>
              <Button onClick={handleCreateApplication} className="bg-blue-600 hover:bg-blue-700">
                Create Your First Application
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {application.universities?.name || 'University Not Selected'}
                    </CardTitle>
                    <CardDescription>
                      {application.university_majors?.choice_label || 'Program Not Selected'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.career_interest && (
                    <p className="text-sm">Career Interest: {application.career_interest}</p>
                  )}
                  {application.highest_degree_intended && (
                    <p className="text-sm">Degree: {application.highest_degree_intended}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
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