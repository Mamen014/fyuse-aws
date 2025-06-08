'use client';

import { useEffect } from 'react';
import { useAuth } from 'hooks/useOnboarding';

function AuthInitializer() {
  const auth = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store user in localStorage if authenticated
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
    }
  }, [auth?.user]);

  return null;
}

export default AuthInitializer;
