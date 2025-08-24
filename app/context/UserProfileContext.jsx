// app/context/UserProfileContext.jsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { getOrCreateSessionId } from "@/lib/session";

const UserProfileContext = createContext(null);

export const UserProfileProvider = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = user?.id_token || user?.access_token;

  const fetchProfile = useCallback(async () => {
    if (!token) return null;
    const sessionId = getOrCreateSessionId();
    try {
      setLoading(true);
      const res = await fetch("/api/user-profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch once when token is ready and profile is still null
  useEffect(() => {
    if (token && !isLoading && profile === null) {
      fetchProfile();
    }
  }, [isLoading, token, profile, fetchProfile]);

  const refreshUserProfile = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refreshUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
