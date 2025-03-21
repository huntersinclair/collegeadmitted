'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let subscription: { unsubscribe: () => void } | null = null;

    const handleCallback = async () => {
      try {
        console.log('Starting auth callback flow...');
        sessionStorage.setItem('isAuthenticating', 'true');
        
        // First, wait for the OAuth callback to complete and establish a session
        const { data: authData, error: authError } = await supabase.auth.getSession();
        console.log('Initial session check:', { 
          hasSession: !!authData.session,
          error: authError
        });
        
        if (authError) throw authError;

        // Get the redirect URL before setting up any listeners
        const redirectTo = sessionStorage.getItem('redirectTo');
        console.log('Stored redirect URL:', redirectTo);

        // If we already have a session, redirect immediately
        if (authData.session) {
          console.log('Session already exists, redirecting...');
          sessionStorage.removeItem('isAuthenticating');
          if (redirectTo) {
            console.log('Redirecting to stored URL:', redirectTo);
            sessionStorage.removeItem('redirectTo');
            router.replace(redirectTo);
          } else {
            console.log('No redirect URL found, going to profile');
            router.replace('/profile');
          }
          return;
        }

        console.log('No session yet, setting up auth state listener...');
        // If we don't have a session yet, set up a one-time listener
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', { event, hasSession: !!session });
          if (event === 'SIGNED_IN' && session) {
            // Clear the timeout since we got a successful sign in
            if (timeoutId) clearTimeout(timeoutId);
            
            // Unsubscribe immediately to prevent multiple redirects
            sub.unsubscribe();
            console.log('Unsubscribed from auth state changes');
            
            // Handle the redirect
            sessionStorage.removeItem('isAuthenticating');
            if (redirectTo) {
              console.log('Auth state listener redirecting to:', redirectTo);
              sessionStorage.removeItem('redirectTo');
              router.replace(redirectTo);
            } else {
              console.log('No redirect URL in listener, going to profile');
              router.replace('/profile');
            }
          }
        });

        // Store the subscription so we can clean it up if needed
        subscription = sub;

        // Set a timeout to avoid hanging indefinitely
        timeoutId = setTimeout(() => {
          console.log('Auth callback timed out');
          sessionStorage.removeItem('isAuthenticating');
          if (subscription) subscription.unsubscribe();
          router.replace('/login?error=timeout');
        }, 10000); // 10 second timeout
      } catch (error) {
        console.error('Auth callback error:', error);
        sessionStorage.removeItem('isAuthenticating');
        router.replace('/login?error=callback_error');
      }
    };

    handleCallback();

    // Cleanup function
    return () => {
      console.log('Cleaning up auth callback...');
      sessionStorage.removeItem('isAuthenticating');
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-blue-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Completing sign in...</h2>
      </div>
    </div>
  );
} 