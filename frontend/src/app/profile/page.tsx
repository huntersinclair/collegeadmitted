'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import { getUserProfile, updateUserProfile, signOut, getSession } from '../api/auth';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    id: '',
    email: '',
    name: '',
    first_name: '',
    last_name: '',
    avatar_url: '',
    bio: '',
    school: '',
    graduation_year: null as number | null,
    major: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    bio: '',
    school: '',
    graduation_year: '',
    major: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data } = await getSession();
      
      if (!data.session) {
        // Redirect to login if no session
        router.push('/login');
        return;
      }
      
      try {
        const profile = await getUserProfile();
        
        // Transform the profile to ensure all fields have values
        setUserData({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          avatar_url: profile.avatar_url || '',
          bio: profile.bio || '',
          school: profile.school || '',
          graduation_year: profile.graduation_year || null,
          major: profile.major || '',
        });
        
        // Check if this is a new user (profile not fully completed)
        const isNewRegistration = !profile.school && !profile.graduation_year && !profile.major;
        setIsNewUser(isNewRegistration);
        
        // Set form data from profile
        setFormData({
          name: profile.name || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          school: profile.school || '',
          graduation_year: profile.graduation_year ? String(profile.graduation_year) : '',
          major: profile.major || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load profile. Please try again.');
        
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('401')) {
          await signOut();
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsUpdating(true);
    
    const updateData = {
      ...formData,
      name: formData.name || `${formData.first_name} ${formData.last_name}`.trim(),
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null,
    };
    
    try {
      const updatedProfile = await updateUserProfile(updateData);
      
      // Transform the profile to ensure all fields have values
      setUserData({
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        first_name: updatedProfile.first_name || '',
        last_name: updatedProfile.last_name || '',
        avatar_url: updatedProfile.avatar_url || '',
        bio: updatedProfile.bio || '',
        school: updatedProfile.school || '',
        graduation_year: updatedProfile.graduation_year || null,
        major: updatedProfile.major || '',
      });
      
      setIsNewUser(false);
      setSuccessMessage(
        isNewUser 
          ? 'Registration completed successfully! Your profile is now set up.'
          : 'Profile updated successfully!'
      );
      
      // If this was the initial setup and we have school info, redirect to dashboard
      if (isNewUser && updateData.school) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch {
      setError('Failed to sign out. Please try again.');
    }
  };

  if (isLoading) {
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
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isNewUser ? 'Complete Your Profile' : 'Your Profile'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isNewUser 
                ? 'Please provide additional information to complete your registration'
                : 'View and update your account information'}
            </p>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
              <p className="mt-1 text-sm text-gray-900">Email: {userData.email}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="first_name"
                name="first_name"
                type="text"
                label="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              
              <Input
                id="last_name"
                name="last_name"
                type="text"
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange}
              />
              
              <Input
                id="school"
                name="school"
                type="text"
                label="School"
                value={formData.school}
                onChange={handleChange}
                required={isNewUser}
              />
              
              <Input
                id="graduation_year"
                name="graduation_year"
                type="number"
                label="Graduation Year"
                value={formData.graduation_year}
                onChange={handleChange}
                required={isNewUser}
              />
              
              <Input
                id="major"
                name="major"
                type="text"
                label="Major"
                value={formData.major}
                onChange={handleChange}
                required={isNewUser}
              />
              
              <Input
                id="bio"
                name="bio"
                type="text"
                label="Bio"
                value={formData.bio}
                onChange={handleChange}
              />
              
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                >
                  {isUpdating 
                    ? 'Updating...' 
                    : isNewUser 
                      ? 'Complete Registration' 
                      : 'Update Profile'
                  }
                </Button>
              </div>
            </form>
            
            {!isNewUser && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 