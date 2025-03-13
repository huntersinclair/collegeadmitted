'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface LoginSearchParamsProps {
  setServerError: (error: string) => void;
}

export default function LoginSearchParams({ setServerError }: LoginSearchParamsProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'social_login_failed') {
      setServerError('Social login failed. Please try again or use email/password.');
    }
  }, [searchParams, setServerError]);

  return null;
} 