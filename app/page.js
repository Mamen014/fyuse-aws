'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useAuth } from 'react-oidc-context';

function AuthActionsInNavbar() {
  const auth = useAuth();

  const handleSignUp = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENTID;
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:3000/';
    const signUpUrl = `https://${domain}/signup?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUri)}`;
    sessionStorage.setItem('cameFromSignup', 'true');
    window.location.href = signUpUrl;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const hasAuthCode = searchParams.get('code');
    const cameFromSignup = sessionStorage.getItem('cameFromSignup') === 'true';
    if (hasAuthCode && cameFromSignup && !localStorage.getItem('loggedInUser')) {
      alert('🎉 Signup complete! Now please log in to start using FYUSE.');
      sessionStorage.removeItem('cameFromSignup');
      searchParams.delete('code');
      const newUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user?.profile?.email) {
      const userData = {
        email: auth.user.profile.email,
        name: auth.user.profile.name || '',
        idToken: auth.user.id_token,
        accessToken: auth.user.access_token,
        refreshToken: auth.user.refresh_token,
        profile: auth.user.profile,
      };
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
    }
    if (!auth?.isAuthenticated) {
      localStorage.removeItem('loggedInUser');
    }
  }, [auth?.isAuthenticated, auth?.user]);

  const handleSignOut = () => {
    localStorage.removeItem('loggedInUser');
    sessionStorage.clear();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const logoutUrl = `https://ap-southeast-2imonu7fwb.auth.ap-southeast-2.amazoncognito.com/logout?client_id=4l7l5ebjj2io1vap6qohbl2i7l&logout_uri=${encodeURIComponent(origin + '/')}`;
    window.location.href = logoutUrl;
  };

  if (auth.isLoading) return null;

  if (auth.isAuthenticated) {
    const username = auth.user?.profile?.name || auth.user?.profile?.email;
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-primary-foreground whitespace-nowrap">Welcome, {username}</span>
        <Link href="/profile" passHref>
          <button className="bg-success text-success-foreground text-sm px-4 py-2 rounded-md shadow">Digital Wardrobe</button>
        </Link>
        <button
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
      <button onClick={() => auth.signinRedirect()} className="bg-cta text-cta-foreground text-sm px-4 py-2 rounded-md">Sign In</button>
      <button onClick={handleSignUp} className="bg-accent text-accent-foreground text-sm px-4 py-2 rounded-md">Sign Up</button>
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-HWPJV516PJ" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-HWPJV516PJ');`}
      </Script>

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <nav className="fixed top-0 left-0 w-full bg-primary text-primary-foreground z-50 shadow-md">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" passHref>
              <Image
                src="/favicon.PNG" // Path to the logo in the public folder
                alt="FYUSE Logo"
                width={120} // Adjust width as needed
                height={20} // Adjust height as needed
                priority
                className="cursor-pointer rounded-xl"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium bg-accent text-accent-foreground px-4 py-1 rounded-md shadow">Home</Link>
              <Link href="/features" className="text-sm font-medium hover:text-muted-foreground">Features</Link>
              <Link href="/about" className="text-sm font-medium hover:text-muted-foreground">About</Link>
              <Link href="/contact" className="text-sm font-medium hover:text-muted-foreground">Contact</Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-muted-foreground">Pricing</Link>
              <AuthActionsInNavbar />
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary-foreground focus:outline-none">
                {isMenuOpen ? '✖' : '☰'}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden bg-muted text-cta p-4 space-y-2">
              <Link href="/" className="block text-sm font-medium">Home</Link>
              <Link href="/features" className="block text-sm font-medium">Features</Link>
              <Link href="/about" className="block text-sm font-medium">About</Link>
              <Link href="/contact" className="block text-sm font-medium">Contact</Link>
              <Link href="/pricing" className="block text-sm font-medium">Pricing</Link>
              <AuthActionsInNavbar />
            </div>
          )}
        </nav>

        <main className="flex-grow mt-20 space-y-20 px-6">
        <section className="bg-background text-foreground px-6 py-12 md:flex md:items-start md:justify-center md:space-x-16">
            <div className="max-w-xl text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Digital Fitting Room</h2>
              <p className="text-base md:text-lg lg:text-xl mb-4">
                No more crowded malls or long fitting room lines. Try on clothes virtually from anywhere, anytime. It's your private fitting room, reimagined.
              </p>
              <Link href="/tryon">
                <button className="bg-cta text-cta-foreground font-bold py-2 px-6 rounded-md">
                  Try-on Now
                </button>
              </Link>
            </div>

            <div className="max-w-xl mt-12 md:mt-0 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary">Personalized Styling</h2>
              <p className="text-base md:text-lg lg:text-xl mb-4">
                Need a quick style boost? We suggest looks based on your body shape, skin tone, and vibe. Fashion advice that’s fast, friendly, and focused on <em>'you'</em>.
              </p>
              <Link href="/styling">
                <button className="bg-accent text-accent-foreground font-bold py-2 px-6 rounded-md">
                  Style Me
                </button>
              </Link>
            </div>
          </section>
        </main>

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