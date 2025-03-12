import Image from "next/image";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card.jsx";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion.jsx";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../components/ui/navigation-menu";
import { Sparkles, Star, CheckCircle } from "lucide-react";

import VirtualTryOnWrapper from "../components/VirtualTryOnWrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="bg-[#1a1a1a] rounded-full px-4 py-2 shadow-sm">
            <h1 className="text-xl font-bold text-white">⚡ Fyuse</h1>
          </div>
          <div className="bg-[#1a1a2f] border border-[#4e4e70] rounded-full px-4 py-1 flex items-center space-x-4 shadow-sm">
            <a href="/" className="px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-700 to-indigo-500 shadow transition">
              Home
            </a>
            <a href="/features" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">
              Features
            </a>
            <a href="/about" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">
              About
            </a>
            <a href="/contact" className="px-4 py-1 rounded-full text-sm font-medium text-white hover:text-purple-200 transition">
              Contact
            </a>
          </div>
          <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-90 transition">
            Book a Call 📞
          </Button>
        </div>
      </nav>

      {/* Hero with Virtual Try-On */}
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
          <div className="md:w-1/2 mt-10 md:mt-0">
            <VirtualTryOnWrapper />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] py-20 px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-purple-100">
              Virtual Try-On Powered by AI
            </h2>
            <p className="text-purple-200 mt-4 max-w-2xl mx-auto">
              Discover how Fyuse lets you see your outfit before wearing it — upload your photo and clothing to preview a realistic look using AI.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Smart Photo Upload</h3>
              <p className="text-sm text-purple-200">
                Upload a clear image of yourself. Our AI prepares it for accurate virtual try-on results.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">👗</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Clothing Detection</h3>
              <p className="text-sm text-purple-200">
                Upload any clothing item — our model detects its shape, texture, and style for a perfect overlay.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2 text-white">AI-Powered Fitting</h3>
              <p className="text-sm text-purple-200">
                Advanced neural networks generate a lifelike image of you wearing the uploaded outfit — instantly.
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-semibold text-lg mb-2 text-white">Fit & Style Analysis</h3>
              <p className="text-sm text-purple-200">
                Get personalized feedback on fit, color match, and style suitability using our Nova Lite analyzer.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-[#1a1a2f] py-20 text-center px-6">
          <h2 className="text-4xl font-bold mb-4 text-white">Start Your Style Transformation Now</h2>
          <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
            Be among the first to experience how AI can revolutionize how you try on clothes. It's fast, fun, and futuristic.
          </p>
          <Button className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-6 py-3 rounded-full text-lg shadow-lg">
            Upload & Try On Now 🚀
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f0c29] border-t border-gray-700 py-8 text-center text-purple-200">
        <p>&copy; 2025 Fyuse. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="https://www.instagram.com/fyuse.id/" className="hover:text-white">Instagram</a>
          <a href="https://www.linkedin.com/in/mzidanfatonie/" className="hover:text-white">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}