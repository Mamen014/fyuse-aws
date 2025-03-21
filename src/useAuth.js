'use client';
import { Auth } from '@aws-amplify/auth';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const checkUser = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return { user, signOut };
};