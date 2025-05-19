"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthActionsInNavbar from "./AuthActionInNavbar.jsx";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-primary text-primary-foreground z-50 shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between h-20">
        {/* Left Side - Hamburger on mobile, Nav links on desktop */}
        <div className="flex items-center w-1/3 justify-start h-full">
          {/* Mobile Hamburger - Visible on both mobile and desktop */}
          <div className="flex items-center justify-start h-full">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary-foreground focus:outline-none h-12 w-12 flex items-center justify-center text-2xl"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? "✖" : "☰"}
            </button>
          </div>

          {/* Desktop Navigation Links - Now inside hamburger menu only */}
          <div className="hidden">
            <Link href="/" className="text-sm font-medium bg-accent text-accent-foreground px-3 py-1 rounded-md shadow">
              Home
            </Link>
            <Link href="/features" className="text-sm font-medium hover:text-muted-foreground">
              Features
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-muted-foreground">
              About
            </Link>
          </div>
        </div>

        {/* Centered Logo */}
        <div className="flex w-1/3 justify-center h-full items-center">
          <Link href="/" passHref>
            <Image
              src="/favicon.PNG"
              alt="FYUSE Logo"
              width={1024}
              height={273}
              priority
              className="cursor-pointer rounded-xl w-32 h-auto"
            />
          </Link>
        </div>

        {/* Right Side - Additional Nav Links and Auth Actions */}
        <div className="flex items-center w-1/3 justify-end h-full">
          <div className="flex items-center h-full">
            <AuthActionsInNavbar />
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="bg-muted text-cta p-4 space-y-2">
          <Link href="/" className="block py-2 text-sm font-medium">
            Home
          </Link>
          <Link href="/features" className="block py-2 text-sm font-medium">
            Features
          </Link>
          <Link href="/about" className="block py-2 text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="block py-2 text-sm font-medium">
            Contact
          </Link>

          {/* Show Sign Out in mobile menu if signed in */}
          <AuthActionsInNavbar isInMobileMenu />
        </div>
      )}
    </nav>
  );
}