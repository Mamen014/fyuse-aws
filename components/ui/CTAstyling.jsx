"use client"

import { useAuth } from "react-oidc-context"
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingModalSpinner from "./LoadingState";

export default function CTAstyling () {
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { user, signinRedirect } = useAuth();

    const handleClick = async (e) => {
    e.preventDefault();
    try {
      setIsRedirecting(true);
      localStorage.setItem('from', 'landing-page');
      localStorage.setItem('showRegister', 'true');
      localStorage.setItem('seeReferral', 'true');
      document.cookie = "hasRegistered=true; path=/; max-age=31536000";      

      if (!user) {
        setTimeout(() => {
          signinRedirect();
        }, 100);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/');
    }
    };

    if (isRedirecting) {
        return <LoadingModalSpinner />;
    }
    return(
        <div>
            <button
                onClick={handleClick}
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full w-full max-w-xs sm:max-w-sm text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mt-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-md"
            >
                Start Free Styling
            </button>        
        </div>
    );
}
