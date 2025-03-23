'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';

const oidcConfig = {
  authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_ImOnU7FwB',
  client_id: '4l7l5ebjj2io1vap6qohbl2i7l',
  redirect_uri: 'http://localhost:3000/',
  post_logout_redirect_uri: 'http://localhost:3000/',
  response_type: 'code',
  scope: 'openid profile email',
};

function AuthInitializer() {
  const auth = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (auth?.isAuthenticated && auth?.user?.profile?.email) {
      const userData = {
        email: auth.user.profile.email,
        idToken: auth.user.id_token,
        accessToken: auth.user.access_token,
        refreshToken: auth.user.refresh_token,
        profile: auth.user.profile,
      };
      const existing = localStorage.getItem('loggedInUser');
      if (!existing || JSON.stringify(userData) !== existing) {
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        console.log('✅ Auth user session stored in localStorage', userData);
      }
    }
  }, [auth?.isAuthenticated, auth?.user]);

  return null;
}

export default function OidcAuthProvider({ children }) {
  return (
    <AuthProvider {...oidcConfig}>
      <AuthInitializer />
      {children}
    </AuthProvider>
  );
}
