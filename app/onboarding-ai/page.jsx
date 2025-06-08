'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function OnboardingAIRedirect() {
  const searchParams = useSearchParams();
  const skipRegister = searchParams.get('skipRegister') === 'true';
  const { user, isLoading, signinRedirect } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in, redirect to login with return URL
    if (!user) {
      // Store the intended destination
      localStorage.setItem('postLoginRedirect', 
        skipRegister ? '/onboarding-ai/upload-photo' : '/onboarding-ai/register'
      );
      signinRedirect();
      return;
    }

    // If user is logged in, handle the appropriate redirection
    if (skipRegister) {
      window.location.href = '/onboarding-ai/upload-photo';
    } else {
      window.location.href = '/onboarding-ai/register';
    }
  }, [isLoading, skipRegister, user, signinRedirect]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1F63]"></div>
    </div>
  );
}
