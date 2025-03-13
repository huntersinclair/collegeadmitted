'use client';

import React from 'react';
import SuccessSearchParams from '../../components/SuccessSearchParams';

const LoginSuccessPage: React.FC = () => {
  return (
    <>
      {/* This component handles URL parameters and redirects */}
      <SuccessSearchParams />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
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
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Completing your sign in...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we redirect you to your profile.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSuccessPage; 