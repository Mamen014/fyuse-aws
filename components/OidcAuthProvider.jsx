"use client";

import React from 'react';
import AuthInitializer from './AuthInitializer'; // Ensure the correct path to AuthInitializer
import { AuthProvider } from 'react-oidc-context'; // Ensure you import the correct AuthProvider

const getOidcConfig = () => {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  return {
    authority: process.env.NEXT_PUBLIC_OIDCAUTH,
    client_id: process.env.NEXT_PUBLIC_CLIENTID,
    redirect_uri: `${origin}/`,
    post_logout_redirect_uri: `${origin}/`,
    response_type: "code",
    scope: "openid profile email",
    loadUserInfo: true,
    response_mode: "query",
    onSigninCallback: () => {
      // Handle the redirect in the app instead of automatic redirect
      window.history.replaceState({}, document.title, window.location.pathname);
    },
  };
};

function OidcAuthProvider({ children }) {
  const oidcConfig = getOidcConfig();

  return (
    <AuthProvider {...oidcConfig}>
      <AuthInitializer />
      {children}
    </AuthProvider>
  );
}

export default OidcAuthProvider;