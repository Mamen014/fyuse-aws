"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "react-oidc-context";
import Image from "next/image";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";

export default function AuthActionsInNavbar({ isInMobileMenu = false }) {
  const auth = useAuth();

  const trackSignInClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "click", {
        event_category: "Authentication",
        event_label: "Sign In Button",
      });
    }
  };

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
    const logoutUrl = `https://ap-southeast-2imonu7fwb.auth.ap-southeast-2.amazoncognito.com/logout?client_id=4l7l5ebjj2io1vap6qohbl2i7l&logout_uri=${encodeURIComponent(
      origin + "/"
    )}`;
    window.location.href = logoutUrl;
  };

  if (auth.isLoading) return null;

  if (auth.isAuthenticated) {
    const username = auth.user?.profile?.name || auth.user?.profile?.email;

    // Inside mobile menu
    if (isInMobileMenu) {
      return (
        <span
          onClick={handleSignOut}
          className="block text-sm font-medium text-red-500 cursor-pointer"
        >
          Sign Out
        </span>
      );
    }

    // On desktop right side
    return (
      <div className="flex items-center space-x-6">
        <Link
          href="/wardrobe"
          passHref
          className="flex flex-col items-center cursor-pointer text-sm text-primary-foreground"
        >
          {/* <Image src="/images/hanger.png" alt="Wardrobe" width={24} height={24} className="mb-1" /> */}
          <Image
            src="/images/coat-hanger-svgrepo-com.svg"
            alt="Wardrobe"
            width={24}
            height={24}
            className="mb-1"
          />
          <span>Digital Wardrobe</span>
        </Link>
      </div>
    );
  }

  return (
    <span
      onClick={() => {
        trackSignInClick();
        auth.signinRedirect();
      }}
      className="flex flex-col items-center cursor-pointer text-sm text-primary-foreground"
    >
      <ArrowRightEndOnRectangleIcon className="h-6 w-6 mb-1" />
      <span>Sign In</span>
    </span>
  );
}
