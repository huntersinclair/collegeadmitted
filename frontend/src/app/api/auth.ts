/**
 * Authentication API client for interacting with the backend auth endpoints
 */

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

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Register a new user with email and password
 */
export async function registerUser(userData: UserRegisterData): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/registration/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  return response.json();
}

/**
 * Login a user with email and password
 */
export async function loginUser(loginData: UserLoginData): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/login/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/user-profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(token: string, userData: { name?: string }): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/user-profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update user profile');
  }

  return response.json();
}

/**
 * Get the URL for social login
 */
export function getSocialLoginUrl(provider: 'google' | 'facebook'): string {
  return `${API_URL}/login/${provider}`;
}

/**
 * Store authentication token in localStorage
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
} 