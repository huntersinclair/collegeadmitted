'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ApplicationPageClient from './ApplicationPageClient';

export default function ApplicationPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ApplicationPageClient />
    </Suspense>
  );
} 