'use client';

import React from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import LoadingModalSpinner from './ui/LoadingState';

const getOidcConfig = () => {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return {
    authority: process.env.NEXT_PUBLIC_OIDCAUTH,
    client_id: process.env.NEXT_PUBLIC_CLIENTID,
    redirect_uri: `${origin}/auth-callback`,
    post_logout_redirect_uri: `${origin}/`,
    response_type: 'code',
    scope: 'openid profile email',
    loadUserInfo: true,
    response_mode: 'query',
  };
};

export default function OidcAuthProvider({ children }) {
  const oidcConfig = getOidcConfig();

  return (
    <AuthProvider {...oidcConfig}>
      {children}
    </AuthProvider>
  );
}
