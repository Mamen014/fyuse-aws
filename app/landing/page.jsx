"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LandingCTA from '@/components/LandingCTA';
import { Camera, Sparkles, Shirt, ChevronDown, Star, Users, Clock, Shield, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  

  // Hero carousel images - placeholder person images
  const heroImages = [
    {
      id: 1,
      src: "/images/hero-image/person1.png",
      alt: "Person 1"
    },
    {
      id: 2, 
      src: "/images/hero-image/person2.png",
      alt: "Person 2"
    },
    {
      id: 3,
      src: "/images/hero-image/person3.png",
      alt: "Person 3"
    }
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);


  // If user is already logged in, redirect to home
  React.useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const testimonials = [
    {
      quote: "I finally found pieces that fit me. Not just models.",
      author: "Dita",
      rating: 5
    },
    {
      quote: "The virtual try-on is incredibly accurate!",
      author: "Sarah",
      rating: 5
    },
    {
      quote: "Saved me so much time and money on returns.",
      author: "Michael",
      rating: 5
    }
  ];

  const howItWorks = [
    {
      number: "1",
      icon: <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80" />,
      title: "Upload Your Photo",
      description: "We'll analyze your physical attributes securely and create your personalized profile."
    },
    {
      number: "2",
      icon: <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80" />,
      title: "Tell Us Your Style",
      description: "Answer a few quick questions about what you like and discover your unique aesthetic."
    },
    {
      number: "3",
      icon: <Shirt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80" />,
      title: "Discover your style",
      description: "Get personalized recommended product tailored to your physical attributes and style preferences"
    },
    {
      number: "4",
      icon: <Shirt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80" />,
      title: "Fitting",
      description: "See how the recommended product looks on your actual body."
    }
  ];

  // Key features highlighting both main functionalities
  const keyFeatures = [
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Personalized Styling",
      description: "Get personalized recommended product tailored to your physical attributes and style preferences"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Digital Fitting Room",
      description: "Try on clothes virtually before buying. See how they look on your actual body"
    },
    // {
    //   icon: <Clock className="w-8 h-8 text-white" />,
    //   title: "Save Time & Money",
    //   description: "Reduce returns by 90% and find perfect fits in minutes, not hours of shopping"
    // }
  ];

  // Social proof stats
  const stats = [
    { number: "50K+", label: "Happy Users" },
    { number: "90%", label: "Return Rate Reduction" },
    { number: "4.9", label: "App Rating" },
    { number: "2M+", label: "Items Tried On" }
  ];

  // FAQ Data
  const faqs = [
    {
      question: "How accurate is the virtual try-on?",
      answer: "Our AI technology is 95% accurate in predicting fit and appearance. We use advanced computer vision and machine learning to map clothing onto your body type with precision comparable to in-store fitting."
    },
    {
      question: "Is my photo data secure?",
      answer: "Absolutely. We use end-to-end encryption for all photos and personal data. Your images are processed locally and securely, never stored permanently, and never shared with brands or third parties."
    },
    {
      question: "How does the personalized styling work?",
      answer: "Our AI analyzes your body measurements, style preferences, lifestyle, and fashion goals to curate personalized recommendations from thousands of brands and retailers that match your unique profile."
    },
    {
      question: "Can I try clothes from any brand?",
      answer: "We partner with over 500 fashion brands and retailers. If you find an item we don't support yet, you can request it and we'll prioritize adding it to our platform."
    },
    {
      question: "How much does Fyuse cost?",
      answer: "Fyuse is completely free to use! We earn commission from partner brands when you make purchases, so you get personalized styling and virtual try-ons at no cost."
    },
    {
      question: "Do you support all body types and sizes?",
      answer: "Yes! Our AI is trained on diverse body types, sizes (XS-5XL), ages, and ethnicities. We believe fashion should be inclusive and work for everyone."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#0B1F63] overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section - Mobile Optimized with Fade Transition */}
        <section className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-13 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Single Centered Image Container with Fade Effect - Mobile Responsive */}
            <div className="relative overflow-hidden py-10 flex justify-center">
              <div className="relative w-[300px] h-[400px]">
                {heroImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={300}
                      height={400}
                      className="rounded-2xl object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content - Mobile Optimized */}
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-[#0B1F63] mb-4 sm:mb-8 leading-tight tracking-tight px-4">
              Personalized styling recommendation <br></br> with digital fitting room
                <br />
              </h1>
              
              <LandingCTA />
            </div>
          </div>
        </section>

        {/* Key Features Section - Mobile Optimized - NOW WITH BLUE BACKGROUND */}
        <section className="py-12 sm:py-20 bg-[#0B1F63] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Two powerful features in one app
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto">
                Combining personalized styling with virtual try-on technology
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {keyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 sm:p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl shadow-sm">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - Mobile Optimized - NOW WITH WHITE BACKGROUND */}
        <section id="how-it-works" className="py-12 sm:py-24 bg-white text-[#0B1F63] relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-8 leading-tight tracking-tight">
                Here's how Fyuse works
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[#0B1F63]/70 max-w-3xl mx-auto leading-relaxed">
                Four simple steps to discover your perfect style
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {howItWorks.map((step, index) => (
                <div 
                  key={index}
                  className="
                    relative text-center p-6 sm:p-10 bg-[#0B1F63]/5 backdrop-blur-sm rounded-2xl
                    border border-[#0B1F63]/20 transition-all duration-300
                    hover:bg-[#0B1F63]/10 hover:shadow-2xl hover:scale-105
                    group
                  "
                >
                  <div className="
                    absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2
                    w-8 h-8 sm:w-12 sm:h-12 bg-[#0B1F63] text-white rounded-full
                    flex items-center justify-center font-bold text-base sm:text-xl
                    shadow-xl
                  ">
                    {step.number}
                  </div>
                  
                  <div className="pt-4 sm:pt-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80">
                      {React.cloneElement(step.icon, { className: "w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-8 text-[#0B1F63] opacity-80" })}
                    </div>
                    
                    <h3 className="text-lg sm:text-2xl font-bold text-[#0B1F63] mb-3 sm:mb-6 leading-tight">
                      {step.title}
                    </h3>
                    
                    <p className="text-[#0B1F63]/70 text-sm sm:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        

        {/* Try-On Carousel with Testimonials - Mobile Optimized */}
        <section className="py-12 sm:py-24 bg-[#0B1F63] relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-8 leading-tight tracking-tight">
                See yourself in a new way
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Real people. Real results. Real confidence.
              </p>
            </div>

            {/* Scrolling Results Carousel with Testimonials - Mobile Responsive */}
            <div className="overflow-x-auto flex space-x-4 p-4">
              {[
                {
                  caption: "What Fyuse picked for Maya",
                  image: "/examples/tryon-1.jpg",
                  testimonial: "Finally found clothes that actually fit my body type perfectly!",
                  author: "Maya K."
                },
                {
                  caption: "Virtual try-on for Alex — before buying",
                  image: "/examples/tryon-2.jpg",
                  testimonial: "Saved me from so many disappointing online purchases. This is a game changer!",
                  author: "Alex R."
                },
                {
                  caption: "Perfect fit recommendations for Emma",
                  image: "/examples/tryon-3.jpg",
                  testimonial: "I used to hate shopping online, now I'm confident every time I order.",
                  author: "Emma L."
                }
              ].map((item, index) => (
                <div key={index} className="min-w-64 sm:min-w-80 bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-xl flex-shrink-0 border border-white/20">
                  <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="w-16 h-20 sm:w-24 sm:h-32 bg-white/10 rounded-xl relative overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.caption}
                        layout="fill"
                        objectFit="cover"
                        className="opacity-70"
                      />
                    </div>
                    <span className="text-xl sm:text-3xl text-white/60">→</span>
                    <div className="w-16 h-20 sm:w-24 sm:h-32 bg-white/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl sm:text-3xl text-white/60">✨</span>
                    </div>
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-white mb-4 leading-relaxed">
                    {item.caption}
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-xs sm:text-sm text-white/80 italic mb-2 leading-relaxed">
                      "{item.testimonial}"
                    </blockquote>
                    <cite className="text-xs sm:text-sm font-semibold text-white">
                      — {item.author}
                    </cite>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>





        {/* FAQ Section - Mobile Optimized */}
        <section className="py-12 sm:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B1F63] mb-4 sm:mb-6 leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-[#0B1F63]/70 max-w-2xl mx-auto">
                Everything you need to know about Fyuse
              </p>
            </div>

            <div className="space-y-4 py-5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-[#0B1F63]/10 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <button
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-[#0B1F63]/20 hover:bg-[#0B1F63]/5 transition-colors duration-200"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#0B1F63] pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-[#0B1F63] transition-transform duration-200 flex-shrink-0 ${
                          openFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6 pt-4">
                      <p className="text-base sm:text-lg text-[#0B1F63]/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Final CTA Section - Mobile Optimized */}
        <section className="py-12 sm:py-24 bg-gradient-to-br from-[#0B1F63] to-[#0B1F63]/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-8 leading-tight tracking-tight">
              Ready to find your style?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
              Join thousands who've revolutionized their shopping experience with personalized styling and virtual try-ons
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center sm:items-center">
              <a
                href="/style-choice"
                className="block sm:inline-block bg-white text-[#0B1F63] px-8 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Start Free Styling
              </a>
              <p className="text-sm text-white/70">✨ No credit card required</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}