"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthActionsInNavbar from "./AuthActionInNavbar.jsx";
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-primary text-primary-foreground z-50 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium bg-accent text-accent-foreground px-4 py-1 rounded-md shadow"
          >
            Home
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium hover:text-muted-foreground"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:text-muted-foreground"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:text-muted-foreground"
          >
            Contact
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:text-muted-foreground"
          >
            Pricing
          </Link>
          <AuthActionsInNavbar />
        </div>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primary-foreground focus:outline-none text-2xl"
            style={{ padding: "10px", lineHeight: 1 }}
          >
            {isMenuOpen ? "✖" : <ArrowRightStartOnRectangleIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-muted text-cta p-4 space-y-2">
          <Link href="/" className="block text-sm font-medium">
            Home
          </Link>
          <Link href="/features" className="block text-sm font-medium">
            Features
          </Link>
          <Link href="/about" className="block text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="block text-sm font-medium">
            Contact
          </Link>
          <Link href="/pricing" className="block text-sm font-medium">
            Pricing
          </Link>
          <AuthActionsInNavbar />
        </div>
      )}
    </nav>
  );
}
