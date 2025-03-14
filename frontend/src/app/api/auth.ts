/**
 * Authentication API client using Supabase
 */
import { supabase } from '@/utils/supabase';

// Types
export interface UserRegisterData {
  email: string;
  name: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  user_id: string;
  token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

/**
 * Register a new user with email and password
 */
export async function registerUser(userData: UserRegisterData): Promise<TokenResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Registration failed');
  }

  if (!data.user || !data.session) {
    throw new Error('Registration successful, but no session created. Please check your email for confirmation.');
  }

  return {
    user_id: data.user.id,
    token: data.session.access_token,
    token_type: 'bearer',
  };
}

/**
 * Login a user with email and password
 */
export async function loginUser(loginData: UserLoginData): Promise<TokenResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });

  if (error) {
    throw new Error(error.message || 'Login failed');
  }

  if (!data.user || !data.session) {
    throw new Error('Login failed. Please try again.');
  }

  return {
    user_id: data.user.id,
    token: data.session.access_token,
    token_type: 'bearer',
  };
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Failed to fetch user profile');
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
  };
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(userData: { name?: string }): Promise<UserProfile> {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: userData,
  });

  if (error || !user) {
    throw new Error('Failed to update user profile');
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login/success`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Google sign in failed');
  }
}

/**
 * Sign in with Facebook
 */
export async function signInWithFacebook(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/login/success`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Facebook sign in failed');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message || 'Sign out failed');
  }
}

/**
 * Get current session
 */
export async function getSession() {
  return await supabase.auth.getSession();
} 