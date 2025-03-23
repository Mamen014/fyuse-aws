'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button.jsx';
import Link from 'next/link.js';
import VirtualTryOnWrapper from '../components/VirtualTryOnWrapper';
import { useAuth } from 'react-oidc-context';

function AuthActionsInNavbar() {
  const auth = useAuth();

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
      console.log('✅ User session stored in localStorage', userData);
    }
  }, [auth?.isAuthenticated, auth?.user]);

  const handleSignOut = () => {
    localStorage.removeItem('loggedInUser');
    auth.signoutRedirect(); // ✅ This will now correctly use post_logout_redirect_uri
  };

  if (auth.isLoading) return null;

  if (auth.isAuthenticated) {
    const username = auth.user?.profile?.name || auth.user?.profile?.email;

    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-white whitespace-nowrap">Welcome, {username}</span>
        <Link href="/profile" passHref>
          <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded">
            My Profile
          </button>
        </Link>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => auth.signinRedirect()}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
      >
        Sign In
      </button>
    </div>
  );
}


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="bg-[#1a1a1a] rounded-full px-4 py-2 shadow-sm">
            <h1 className="text-xl font-bold text-white">FYUSE</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-700 to-indigo-500 shadow transition">Home</a>
            <a href="/features" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">Features</a>
            <a href="/about" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">About</a>
            <a href="/contact" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">Contact</a>
            <AuthActionsInNavbar />
          </div>
        </div>
      </nav>

      <main className="mt-10">
        <section className="pt-10 pb-8 container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Try On Fashion <br className="hidden md:block" /> With AI
            </h1>
            <p className="text-purple-100 text-lg">
              Upload your photo and see how different styles look on you instantly.
            </p>
            <Button className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 text-lg">
              Get Started
            </Button>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0" id="app">
            <VirtualTryOnWrapper />
          </div>
        </section>

        <section className="bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] py-20 px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-purple-100">Virtual Try-On Powered by AI</h2>
            <p className="text-purple-200 mt-4 max-w-2xl mx-auto">
              Discover how FYUSE lets you see your outfit before wearing it — upload your photo and clothing to preview a realistic look using AI.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Smart Photo Upload</h3>
              <p className="text-sm text-purple-200">Upload a clear image of yourself. Our AI prepares it for accurate virtual try-on.</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">👗</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Clothing Detection</h3>
              <p className="text-sm text-purple-200">Upload any clothing item — our model detects its shape and style for a perfect overlay.</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2 text-white">AI-Powered Fitting</h3>
              <p className="text-sm text-purple-200">AI generates a lifelike image of you wearing the uploaded outfit — instantly.</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Fit & Style Analysis</h3>
              <p className="text-sm text-purple-200">Get personalized feedback on fit, color match, and style suitability using our AI analyzer.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#1a1a2f] py-20 text-center px-6">
          <h2 className="text-4xl font-bold mb-4 text-white">Start Your Style Transformation Now</h2>
          <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
            Be among the first to experience how AI can revolutionize how you try on clothes. It's fast, fun, and futuristic.
          </p>
          <Link href="#app" passHref>
            <button
              type="button"
              className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-6 py-3 rounded-full text-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Upload & Try On Now 🚀
            </button>
          </Link>
        </section>
      </main>

      <footer className="bg-[#0f0c29] border-t border-gray-700 py-8 text-center text-purple-200">
        <p>&copy; 2025 FYUSE. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="https://www.instagram.com/fyuse.id/" className="hover:text-white">Instagram</a>
        </div>
      </footer>
    </div>
  );
}
