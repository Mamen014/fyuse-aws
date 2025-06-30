'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import LoadingModalSpinner from './LoadingModal';

export default function LandingCTA({ className = '' }) {
  const router = useRouter();
  const { user, signinRedirect } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      localStorage.setItem('postLoginRedirect', '/style-discovery');

      if (!user) {
        setTimeout(() => {
          signinRedirect();
        }, 100);
      } else {
        router.push('/style-discovery');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/style-discovery');
    }
  };


  return (
    <>
      {loading && (
        <LoadingModalSpinner />
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mb-4 sm:mb-6 cursor-pointer w-full sm:w-auto ${className || 'bg-[#0B1F63] text-white hover:bg-[#0B1F63]/90'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Start Free Styling
      </button>
    </>
  );
}
