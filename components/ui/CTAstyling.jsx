"use client"

import { useAuth } from "react-oidc-context"
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingModalSpinner from "./LoadingState";
import { sendGAEvent } from '@next/third-parties/google';

export default function CTAstyling () {
    const router = useRouter()
    const pathname = usePathname();
    const [pageLoadTime, setPageLoadTime] = useState(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { user, signinRedirect } = useAuth();

    useEffect(() => {
      setPageLoadTime(Date.now());
    }, []); 

    const handleClick = async (e) => {
      e.preventDefault();

      let timeToClickSeconds = null;
      if (pageLoadTime) {
          const currentTime = Date.now();
          const durationMs = currentTime - pageLoadTime;
          timeToClickSeconds = Math.round(durationMs / 1000); // Convert milliseconds to seconds
          console.log(`Time to click: ${timeToClickSeconds} seconds`); // For debugging
      } else {
          console.warn('pageLoadTime was not set, cannot calculate time to click.');
      }      

      sendGAEvent({
          event: 'click_start_free_styling',
          page_context: pathname,  
          user_status: user ? 'authenticated' : 'unauthenticated',
          time_to_click_seconds: timeToClickSeconds,
      });    
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
