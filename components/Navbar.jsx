"use client";

import { lazy, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, Info, Phone, CreditCard, Sparkles, BookOpenText, ChevronRight } from "lucide-react";
import AuthActionsInNavbar from "./signOut.jsx";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import LoadingModalSpinner from "./LoadingModal.jsx";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [Loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;
  const userName = auth?.user?.profile?.name || userEmail?.split('@')[0] || 'Guest';

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      {/* Main Navbar */}
      {Loading && (
        <LoadingModalSpinner
          message="Redirecting..."
          subMessage="Please wait a moment"
        />
      )}

      <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Hamburger */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-16 h-16 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-10 h-10 text-gray-700" />
          ) : (
            <Menu className="w-10 h-10 text-gray-700" />
          )}
        </button>

        {/* Center - Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/dashboard" className="block">
            <Image
              src="/logo.PNG"
              alt="FYUSE Logo"
              width={144}
              height={39}
              priority
              className="w-36 h-auto"
            />
          </Link>
        </div>

        {/* Right - Auth Actions */}
        <div className="flex items-center">
          <AuthActionsInNavbar />
        </div>
      </div>

      {/* Mobile Menu - Slide from left */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`fixed top-16 left-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform duration-200 ease-in-out overflow-hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User Profile Section */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {userName}
              </h3>
              {userEmail && (
                <p className="text-sm text-gray-500 truncate">{userEmail}</p>
              )}
            </div>
            <div className="px-4 text-red-600">
            <AuthActionsInNavbar isInMobileMenu />
          </div>
          </div>
        </div>

        

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100%-160px)] py-4">
          <div className="px-4 pb-2">
            <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Menu
            </p>
          </div>

          <div className="px-4 space-y-1">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/dashboard");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-gray-500" />
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/features");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Sparkles className="w-5 h-5 text-gray-500" />
              <span>Features</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/about");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5 text-gray-500" />
              <span>About</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/pricing");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span>Pricing</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/contact");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-500" />
              <span>Contact</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setLoading(true);
                router.push("/journal");
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BookOpenText className="w-5 h-5 text-gray-500" />
              <span>Journal</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>            
          </div>
        </div>
      </div>
    </nav>
  );
}