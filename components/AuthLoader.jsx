'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'hooks/useOnboarding';

export default function AuthLoader({ children }) {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Skip auth check if we're not in the browser
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Handle the redirect after sign-in
    const handleAuthRedirect = async () => {
      if (auth?.isLoading) return;

      const postLoginRedirect = localStorage.getItem('postLoginRedirect');
      
      if (auth?.isAuthenticated && postLoginRedirect) {
        // Clear the redirect URL before navigating
        localStorage.removeItem('postLoginRedirect');
        
        // Use a small timeout to ensure the auth state is fully updated
        setTimeout(() => {
          router.push(postLoginRedirect);
        }, 100);
      }
      
      setIsLoading(false);
    };

    handleAuthRedirect();
  }, [auth, router]);

  // Show loading state while checking auth or during Cognito redirect
  if (!isMounted || isLoading || (auth?.isLoading && window.location.pathname.includes('cognito'))) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0B1F63]"></div>
        <p className="text-[#0B1F63] font-medium">Preparing your experience...</p>
      </div>
    );
  }

  return children;
}
