'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LandingCTA({ className = '' }) {
  const router = useRouter();
  const { user, signinRedirect } = useAuth();

  const handleClick = async (e) => {
    e.preventDefault();
    
    try {
      // Store the intended destination
      localStorage.setItem('postLoginRedirect', '/style-discovery');
      
      if (!user) {
        // If not logged in, redirect to login
        await signinRedirect();
      } else {
        // If logged in, go to style-discovery
        router.push('/style-discovery');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fallback in case of error
      router.push('/style-discovery');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mb-4 sm:mb-6 cursor-pointer w-full sm:w-auto ${className || 'bg-[#0B1F63] text-white hover:bg-[#0B1F63]/90'}`}
    >
      Start Free Styling
    </button>
  );
}
