// app/context/UserProfileContext.jsx

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { getOrCreateSessionId } from "@/lib/session";

const UserProfileContext = createContext(null);

export const UserProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = user?.id_token || user?.access_token;

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    const sessionId = getOrCreateSessionId();
    setLoading(true);
    try {
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
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setProfile(null); // ensure it's explicitly null on failure
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !profile) {
      fetchProfile();
    }
  }, [token, profile, fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refetchProfile: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
