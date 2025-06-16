// hooks/useOnboarding.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useOidcAuth } from 'react-oidc-context';

// Wrapper around react-oidc-context
export function useAuth() {
  const oidc = useOidcAuth();
  const router = useRouter();

  const publicPaths = ['/landing-page', '/style-choice'];
  const isPublicPath = typeof window !== 'undefined' && publicPaths.includes(window.location.pathname);

  return {
    isAuthenticated: !!oidc.user,
    user: oidc.user,
    isLoading: oidc.isLoading,
    signinRedirect: () => {
      // Don't redirect if on public path
      if (isPublicPath) return;
      
      // Store current path for post-login redirect if not a public path
      if (typeof window !== 'undefined' && !isPublicPath) {
        localStorage.setItem('postLoginRedirect', window.location.pathname);
      }
      return oidc.signinRedirect();
    },
    isPublicPath,
  };
}

export function useOnboarding() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isPublicPath } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait for auth state to load
    if (isPublicPath) return; // don't redirect if on public path

    if (!isAuthenticated) {
      // optionally: redirect to login or wait
      return;
    }

    // Check if user has completed onboarding (example logic)
    // Commented out to prevent redirection based on onboarding_step
    // const step = localStorage.getItem('onboarding_step');
    // if (step !== 'appearance') {
    //   router.push('/onboarding/register');
    // }
  }, [isAuthenticated, isLoading, router, isPublicPath]);
}
