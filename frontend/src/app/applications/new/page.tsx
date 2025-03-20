'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationService } from '@/services/applicationService';
import { Loader2 } from 'lucide-react';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateApplication = async () => {
    try {
      setLoading(true);
      const newApplication = await ApplicationService.createApplication({
        status: 'draft'
      });
      router.push(`/applications/${newApplication.id}`);
    } catch (err) {
      setError('Failed to create application');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Application</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Click below to start a new college application. You&apos;ll be guided through the process step by step.
            </p>
            <Button 
              onClick={handleCreateApplication} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start New Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 