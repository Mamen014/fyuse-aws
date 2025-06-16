'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'hooks/useOnboarding';

function AuthInitializer() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ⏳ Wait until auth finishes loading
    if (auth.isLoading) return;

    // ✅ Once loaded and authenticated
    if (auth?.user?.profile?.email) {
      const userData = {
        email: auth.user.profile.email,
        name: auth.user.profile.name || '',
        idToken: auth.user.id_token,
        accessToken: auth.user.access_token,
        refreshToken: auth.user.refresh_token,
        profile: auth.user.profile,
      };

      const existing = localStorage.getItem('loggedInUser');
      if (!existing || JSON.stringify(userData) !== existing) {
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        console.log('✅ Auth user session stored in localStorage:', userData);
      }

      // ⛳ Handle post-login redirect if exists
      const redirectPath = localStorage.getItem('postLoginRedirect');
      if (redirectPath) {
        localStorage.removeItem('postLoginRedirect');
        router.push(redirectPath);
      }
    }
  }, [auth?.user, auth.isLoading]);

  return null;
}

export default AuthInitializer;
