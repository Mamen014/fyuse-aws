"use client";

import { useState, useEffect } from "react";
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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Guest");

  const router = useRouter();
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem("profile") || "{}");
      const fallback = userEmail?.split("@")[0] || "Guest";
      setUserName(stored.nickname || fallback);
    } catch (err) {
      console.warn("Failed to load user profile from localStorage", err);
    }
  }, [userEmail]);

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
    if (auth.isLoading || !auth.isAuthenticated) return null;
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

  const menuItems = auth.isAuthenticated
    ? [...authOnlyMenuItems, ...baseMenuItems]
    : baseMenuItems;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      {loading && <LoadingModalSpinner message="Redirecting..." subMessage="Please wait a moment" />}

      <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-16 h-16 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-10 h-10 text-gray-700" /> : <Menu className="w-10 h-10 text-gray-700" />}
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/dashboard">
            <Image src="/logo-tb.png" alt="FYUSE Logo" width={1920} height={800} priority className="h-20 w-auto" />
          </Link>
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
        {auth.isAuthenticated && (
          <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{userName}</h3>
                {userEmail && <p className="text-sm text-gray-500 truncate">{userEmail}</p>}
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