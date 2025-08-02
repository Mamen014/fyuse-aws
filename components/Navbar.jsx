// components/Navbar.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Info,
  Phone,
  CreditCard,
  Sparkles,
  BookOpenText,
  ChevronRight,
  LayoutGrid,
  HistoryIcon,
  Shirt
} from "lucide-react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import LoadingModalSpinner from "./ui/LoadingState.jsx";
import { useUserProfile } from "@/app/context/UserProfileContext.jsx";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const userEmail = user?.profile?.email;
  const userName = profileLoading ? "" : (profile?.nickname || userEmail.split("@")[0] ||"Guest");


  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.removeItem("hasRegistered");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const logoutUrl = `https://ap-southeast-2imonu7fwb.auth.ap-southeast-2.amazoncognito.com/logout?client_id=4l7l5ebjj2io1vap6qohbl2i7l&logout_uri=${encodeURIComponent(
      origin + "/"
    )}`;
    window.location.href = logoutUrl;
  };

  const SignOutButton = ({ isInMobileMenu = false }) => {
    if (isLoading || !user) return null;
    const className = isInMobileMenu
      ? "block text-sm font-medium text-red-500 cursor-pointer"
      : "text-sm text-gray-600 hover:text-red-500 font-medium px-4 py-2";

    return (
      <button onClick={handleSignOut} className={className}>
        Sign Out
      </button>
    );
  };

  const baseMenuItems = [
    { label: "Features", icon: Sparkles, path: "/features" },
    { label: "About", icon: Info, path: "/about" },
    { label: "Contact", icon: Phone, path: "/contact" },
    { label: "Journal", icon: BookOpenText, path: "/journal" },
  ];

  const authOnlyMenuItems = [
    { label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { label: "Plan", icon: CreditCard, path: "/plan" },
    { label: "Styling History", icon: HistoryIcon, path: "/history" },
    { label: "Wardrobe", icon: Shirt, path: "/wardrobe" },
  ];

  const menuItems = user
    ? [...authOnlyMenuItems, ...baseMenuItems]
    : baseMenuItems;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      {loading && <LoadingModalSpinner message="Redirecting..." subMessage="Please wait a moment" />}

      <div className="h-16 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto">

        {/* Left: Hamburger */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-16 h-16 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-10 h-10 text-gray-700" /> : <Menu className="w-10 h-10 text-gray-700" />}
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center min-w-0 overflow-hidden">
          <Link href="/dashboard">
            <Image
            src="/logo-tb.png"
            alt="FYUSE Logo"
            aria-label="Home"
            width={1920}
            height={800}
            priority
            className="h-12 w-auto max-w-[160px] sm:max-w-[200px]"
          />
          </Link>
        </div>
        {/* Right: Empty div to balance flex layout */}
        <div className="w-12">
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-14 left-0 bottom-0 w-120 bg-white shadow-xl transform transition-transform duration-200 ease-in-out overflow-hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {user && (
          <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{userName || "Guest"}</h3>
              </div>
              <div className="px-0 text-red-600">
                <SignOutButton isInMobileMenu />
              </div>
            </div>
          </div>
        )}


        <div className="overflow-y-auto h-[calc(100%-160px)] py-4">
          <div className="px-4 pb-2">
            <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</p>
          </div>

          <div className="px-4 space-y-1">
            {menuItems.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                  onClick={() => {
                    if (path === window.location.pathname) {
                      setIsMenuOpen(false);
                      return;
                    }
                    setIsMenuOpen(false);
                    setLoading(true);
                    router.push(path);
                  }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-500" />
                <span>{label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}