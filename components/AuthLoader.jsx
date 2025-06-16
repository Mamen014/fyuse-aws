'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'hooks/useOnboarding';

export default function AuthLoader({ children }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Skip auth check if we're not in the browser
    if (typeof window === 'undefined') {
      return;
    }

    const handleAuthState = async () => {
      // If we're in the middle of a Cognito redirect, show loading
      if (window.location.pathname.includes('cognito')) {
        return;
      }

      // If auth is still loading, wait
      if (auth.isLoading) {
        return;
      }

      const postLoginRedirect = localStorage.getItem('postLoginRedirect');
      const isAuthPage = pathname === '/landing' || pathname === '/';

      // Handle authenticated user
      if (auth.isAuthenticated) {
        // If there's a post-login redirect, handle it
        if (postLoginRedirect) {
          localStorage.removeItem('postLoginRedirect');
          router.replace(postLoginRedirect);
          return;
        }
        
        // If user is on auth page, redirect to home
        if (isAuthPage) {
          router.replace('/style-discovery');
          return;
        }
      } 
      // Handle unauthenticated user
      else if (!isAuthPage) {
        // Save the current path for post-login redirect
        localStorage.setItem('postLoginRedirect', pathname);
        router.replace('/landing');
        return;
      }

      // If we get here, we're either:
      // 1. Authenticated and on a protected page, or
      // 2. Unauthenticated and on the auth page
      setIsLoading(false);
    };

    handleAuthState();
  }, [auth, router, pathname]);

  // Show loading state while we're:
  // 1. Still mounting
  // 2. Still loading auth state
  // 3. In the middle of a Cognito redirect
  // 4. Still processing the auth state
  if (!isMounted || auth.isLoading || window.location.pathname.includes('cognito') || isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0B1F63]"></div>
        <p className="text-[#0B1F63] font-medium">Preparing your experience...</p>
      </div>
    );
  }

  return children;
}
