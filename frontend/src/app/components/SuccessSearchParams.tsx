'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function SuccessSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we have a session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        router.push('/login?error=social_login_failed');
        return;
      }
      
      if (data.session) {
        // Session exists, redirect to profile
        router.push('/profile');
      } else {
        // No session, redirect to login
        router.push('/login?error=social_login_failed');
      }
    };
    
    handleAuthRedirect();
  }, [router, searchParams]);

  return null;
} 