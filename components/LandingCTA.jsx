'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LandingCTA() {
  const router = useRouter();
  const { user, signinRedirect } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    
    // Store the intended destination
    localStorage.setItem('postLoginRedirect', '/style-choice');
    
    if (!user) {
      // If not logged in, redirect to login
      signinRedirect();
    } else {
      // If logged in, go to style-choice
      router.push('/style-choice');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-block bg-[#0B1F63] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold hover:bg-[#0B1F63]/90 transition-all duration-300 shadow-xl mb-4 sm:mb-6 cursor-pointer w-full sm:w-auto"
    >
      Start Free Styling
    </button>
  );
}
