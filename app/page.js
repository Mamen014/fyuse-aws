"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "react-oidc-context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, isLoading, signinRedirect } = useAuth();

  // Handle post-login redirect
  useEffect(() => {
    if (!isLoading && user) {
      const redirectPath = localStorage.getItem("postLoginRedirect");
      if (redirectPath) {
        localStorage.removeItem("postLoginRedirect");
        window.location.href = redirectPath;
      }
    }
  }, [user, isLoading]);

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id= ${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}');
        `}
      </Script>

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />

        <main className="flex-grow mt-20 px-6">
          <div className="flex flex-col gap-4">
            {/* Digital Fitting Room Section */}
            <section className="bg-background text-foreground px-6 py-8 md:py-12 md:flex md:items-center md:justify-center md:space-x-16">
              {/* Left Column: Text */}
              <div className="md:w-1/2 mb-8 md:mb-0 text-center">
                <h2 className="text-4xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Digital Fitting Room
                </h2>
                <p className="text-base md:text-lg lg:text-xl mb-4">
                  No more crowded malls or long fitting room lines. Try on
                  clothes virtually from anywhere, anytime.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      // Save intended route before redirecting to sign in
                      localStorage.setItem(
                        "postLoginRedirect",
                        "/onboarding/register"
                      );

                      toast.error("Please sign in to use the Try-on feature.", {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                      });
                      setTimeout(() => signinRedirect(), 1500);
                    } else {
                      const step = localStorage.getItem("onboarding_step");
                      window.location.href = step === "appearance"
                        ? "/tryon"
                        : "/onboarding/register";
                    }
                  }}
                  className="bg-cta text-cta-foreground font-bold py-2 px-6 rounded-md"
                >
                  Try-on Now
                </button>
              </div>

              {/* Right Column: Image */}
              <div className="md:w-1/2 flex justify-center">
                <Image
                  src="/images/howitworks.jpg"
                  alt="How it Works"
                  width={913}
                  height={1217}
                  priority
                  className="rounded-xl"
                />
              </div>
            </section>

            {/* Personalized Styling Section */}
            <section className="bg-background text-foreground px-6 py-8 md:py-12 md:flex md:items-center md:justify-center md:space-x-16">
              {/* Left Section */}
              <div className="md:w-1/2 mb-8 md:mb-0 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Personalized Styling
                </h2>
                <p className="text-base md:text-lg lg:text-xl mb-4">
                  Need a quick style boost? We suggest looks based on your body shape, skin tone, and vibe. Fashion advice that’s fast, friendly, and focused on <em>'you'</em>.
                </p>
                <button
                  onClick={() => {
                    if (!user) {
                      localStorage.setItem("postLoginRedirect", "/styling");

                      toast.error("Please sign in to use the Styling feature.", {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                      });
                      setTimeout(() => signinRedirect(), 1500);
                    } else {
                      window.location.href = "/styling";
                    }
                  }}
                  className="bg-cta text-cta-foreground font-bold py-2 px-6 rounded-md"
                >
                  Style Me
                </button>
              </div>

              {/* Right Column: Image */}
              <div className="md:w-1/2 flex justify-center">
                <Image
                  src="/images/personalisedStyling2.png"
                  alt="Personalized Styling"
                  width={913}
                  height={1217}
                  priority
                  className="rounded-xl"
                />
              </div>
            </section>
          </div>
        </main>

        <ToastContainer />
        <footer className="bg-primary text-primary-foreground py-8 text-center">
          <p>&copy; 2025 FYUSE. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/features">Features</Link>
          </div>
        </footer>
      </div>
    </>
  );
}