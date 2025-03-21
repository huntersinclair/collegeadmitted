'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApplicationClient } from './ApplicationClient';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const applicationId = searchParams.get('id');

  useEffect(() => {
    if (!authLoading && !user) {
      // Store the current URL as the redirect destination
      sessionStorage.setItem('redirectTo', `/applications/application?id=${applicationId}`);
      router.replace('/login');
    }
  }, [user, authLoading, router, applicationId]);

  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ApplicationClient />
    </Suspense>
  );
} 