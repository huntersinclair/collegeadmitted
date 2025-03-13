'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { storeAuthToken } from '../api/auth';

export default function SuccessSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL parameters
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    
    if (token && userId) {
      // Store token in localStorage
      storeAuthToken(token);
      
      // Redirect to profile page
      router.push('/profile');
    } else {
      // If no token, redirect to login page with error
      router.push('/login?error=social_login_failed');
    }
  }, [router, searchParams]);

  return null;
} 