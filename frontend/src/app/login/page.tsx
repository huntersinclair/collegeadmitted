'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handlePostLogin = useCallback(async () => {
    const redirectTo = sessionStorage.getItem('redirectTo');
    if (redirectTo) {
      sessionStorage.removeItem('redirectTo');
      router.replace(redirectTo);
    } else {
      router.replace('/profile');
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading && user) {
      handlePostLogin();
    }
  }, [user, isLoading, handlePostLogin]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to sign in
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              textTransform: 'none',
              borderColor: '#E5E7EB',
              color: '#374151',
              '&:hover': {
                borderColor: '#D1D5DB',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
} 