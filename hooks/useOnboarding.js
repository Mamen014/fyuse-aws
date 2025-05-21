// hooks/useOnboarding.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // useRouter from 'next/router' is outdated in App Router
import { useAuth as useOidcAuth } from 'react-oidc-context';

// Wrapper around react-oidc-context
export function useAuth() {
  const oidc = useOidcAuth();

  return {
    isAuthenticated: !!oidc.user,
    user: oidc.user,
    isLoading: oidc.isLoading,
    signinRedirect: oidc.signinRedirect,
  };
}

export function useOnboarding() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait for auth state to load

    if (!isAuthenticated) {
      // optionally: redirect to login or wait
      return;
    }

    // Check if user has completed onboarding (example logic)
    const step = localStorage.getItem('onboarding_step');
    if (step !== 'appearance') {
      router.push('/onboarding/register');
    }
  }, [isAuthenticated, isLoading, router]);
}
