'use client';

import { useEffect, Suspense } from 'react';
import { useAuth } from 'react-oidc-context';

function OnboardingAIRedirectContent() {
  const { user, isLoading, signinRedirect } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // If user is not logged in, redirect to login with return URL to register page
    if (!user) {
      localStorage.setItem('postLoginRedirect', '/discover-your-style/register');
      signinRedirect();
      return;
    }

    // If user is logged in, redirect to register page
    window.location.href = '/discover-your-style/register';
  }, [isLoading, user, signinRedirect]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1F63]"></div>
    </div>
  );
}

export default function OnboardingAIRedirect() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1F63]"></div>
      </div>
    }>
      <OnboardingAIRedirectContent />
    </Suspense>
  );
}
