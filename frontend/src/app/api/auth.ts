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
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  school?: string;
  graduation_year?: number | null;
  major?: string;
}

export interface ProfileUpdateData {
  name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  school?: string;
  graduation_year?: number | null;
  major?: string;
  avatar_url?: string;
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
  // First get user data from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Failed to fetch user profile');
  }

  // Then get the profile data from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.warn('Error fetching profile details:', profileError);
  }

  // Combine Auth user and profile data
  return {
    id: user.id,
    email: user.email || '',
    name: profile?.display_name || user.user_metadata?.name || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
    school: profile?.school || '',
    graduation_year: profile?.graduation_year || null,
    major: profile?.major || '',
  };
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(userData: ProfileUpdateData): Promise<UserProfile> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }
  
  // Update name in Supabase Auth if provided
  if (userData.name) {
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { name: userData.name }
    });
    
    if (updateAuthError) {
      console.warn('Error updating auth user metadata:', updateAuthError);
    }
  }
  
  // Prepare data for profiles table
  const profileData: Record<string, string | number | null> = {};
  
  if (userData.name) {
    profileData.display_name = userData.name;
  }
  
  if (userData.first_name) {
    profileData.first_name = userData.first_name;
  }
  
  if (userData.last_name) {
    profileData.last_name = userData.last_name;
  }
  
  if (userData.bio !== undefined) {
    profileData.bio = userData.bio;
  }
  
  if (userData.school !== undefined) {
    profileData.school = userData.school;
  }
  
  if (userData.graduation_year !== undefined) {
    profileData.graduation_year = userData.graduation_year;
  }
  
  if (userData.major !== undefined) {
    profileData.major = userData.major;
  }
  
  if (userData.avatar_url) {
    profileData.avatar_url = userData.avatar_url;
  }
  
  // Only update profiles table if we have data to update
  if (Object.keys(profileData).length > 0) {
    profileData.updated_at = new Date().toISOString();
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
  }
  
  // Return the updated profile
  return await getUserProfile();
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