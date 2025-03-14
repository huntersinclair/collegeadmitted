import React from 'react';
import { signInWithGoogle, signInWithFacebook } from '../api/auth';

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, className = '' }) => {
  const handleClick = async () => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  const getButtonStyle = () => {
    if (provider === 'google') {
      return {
        bgColor: 'bg-white hover:bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        icon: (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
        ),
        text: 'Continue with Google',
      };
    } else {
      return {
        bgColor: 'bg-blue-600 hover:bg-blue-700',
        textColor: 'text-white',
        borderColor: 'border-blue-600',
        icon: (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"
            />
          </svg>
        ),
        text: 'Continue with Facebook',
      };
    }
  };

  const style = getButtonStyle();

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center w-full px-4 py-2 border ${style.borderColor} rounded-md shadow-sm ${style.bgColor} ${style.textColor} font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {style.icon}
      {style.text}
    </button>
  );
};

export default SocialButton; 