'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
const getOidcConfig = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return {
    authority: process.env.NEXT_PUBLIC_OIDCAUTH,
    client_id: process.env.NEXT_PUBLIC_CLIENTID,
    redirect_uri: `${origin}/`,
    post_logout_redirect_uri: `${origin}/`,
    response_type: 'code',
    scope: 'openid profile email',
    loadUserInfo: true,
    response_mode: 'query'
  };
  
};


function AuthInitializer() {
  const auth = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (auth?.isAuthenticated && auth?.user?.profile?.email) {
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
  }, [auth?.isAuthenticated, auth?.user]);

  return null;
}

export default function OidcAuthProvider({ children }) {
  const oidcConfig = getOidcConfig();

  return (
    <AuthProvider {...oidcConfig}>
      <AuthInitializer />
      {children}
    </AuthProvider>
  );
}
