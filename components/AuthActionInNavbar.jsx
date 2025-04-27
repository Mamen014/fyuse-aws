"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "react-oidc-context";

export default function AuthActionsInNavbar() {
  const auth = useAuth();

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user?.profile?.email) {
      const userData = {
        email: auth.user.profile.email,
        name: auth.user.profile.name || "",
        idToken: auth.user.id_token,
        accessToken: auth.user.access_token,
        refreshToken: auth.user.refresh_token,
        profile: auth.user.profile,
      };
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
    }
    if (!auth?.isAuthenticated) {
      localStorage.removeItem("loggedInUser");
    }
  }, [auth?.isAuthenticated, auth?.user]);

  const handleSignOut = () => {
    localStorage.removeItem("loggedInUser");
    sessionStorage.clear();
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const logoutUrl = `https://ap-southeast-2imonu7fwb.auth.ap-southeast-2.amazoncognito.com/logout?client_id=4l7l5ebjj2io1vap6qohbl2i7l&logout_uri=${encodeURIComponent(origin + "/")}`;
    window.location.href = logoutUrl;
  };

  if (auth.isLoading) return null;

  if (auth.isAuthenticated) {
    const username = auth.user?.profile?.name || auth.user?.profile?.email;
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-primary-foreground whitespace-nowrap">
          Welcome, {username}
        </span>
        <Link href="/profile" passHref>
          <button
            type="button"
            className="bg-success text-success-foreground text-sm px-4 py-2 rounded-md shadow"
          >
            Digital Wardrobe
          </button>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="bg-destructive text-destructive-foreground text-sm px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => auth.signinRedirect()}
        className="bg-cta text-cta-foreground text-sm px-4 py-2 rounded-md"
      >
        Sign In / Register
      </button>
    </div>
  );
}
