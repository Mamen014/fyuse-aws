"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingModalSpinner from '@/components/ui/LoadingState';

export default function LandingPage() {
  const router = useRouter();
  const { user, signinRedirect } = useAuth();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Hero carousel images - placeholder person images
  const heroImages = [
    {
      id: 1,
      src: "/images/hero-image/p1.png",
      alt: "Person 1"
    },
    {
      id: 2, 
      src: "/images/hero-image/p2.png",
      alt: "Person 2"
    },
    {
      id: 3,
      src: "/images/hero-image/p3.png",
      alt: "Person 3"
    },
        {
      id: 4,
      src: "/images/hero-image/p4.png",
      alt: "Person 4"
    },
        {
      id: 5,
      src: "/images/hero-image/p5.png",
      alt: "Person 5"
    }
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    localStorage.setItem('showRegister', 'true');
    localStorage.setItem('hasSeenReferral', 'true');
  });

  // How it works steps
  const howItWorks = [
    {
      number: "1",
      icon: "/images/step-1.png",
      title: "Upload Your Photo",
      description: "We'll analyze your physical attributes securely and create your personalized profile."
    },
    {
      number: "2",
      icon: "/images/step-2.png",
      title: "Tell Us Your Style",
      description: "Answer a few quick questions about what you like and discover your unique aesthetic."
    },
    {
      number: "3",
      icon: "/images/step-3.png",
      title: "Discover your style",
      description: "Discover outfit recommendations tailored to your body shape, skin tone, and styling preference"
    },
    {
      number: "4",
      icon: "/images/step-4.png",
      title: "Digital Fitting Room",
      description: "Try on clothes virtually before buying. See how they look on your actual body"
    }
  ];

  // Key features highlighting both main functionalities
  const keyFeatures = [
    {
      icon: "/images/step-3.png",
      title: "Discover your style",
      description: "Discover outfit recommendations tailored to your body shape, skin tone, and styling preference"
    },
    {
      icon: "/images/step-4.png",
      title: "Digital Fitting Room",
      description: "Try on clothes virtually before buying. See how they look on your actual body"
    },

  ];

  // FAQ Data
  const faqs = [
    {
      question: "Is my data secure?",
      answer: "Absolutely. We only collect what we need—your photos and style choices—to style you better. Your data is locked away in secure cloud storage, never sold, and only shared with trusted partners when the law requires. You can view, update, or delete it at any time."
    },
    {
      question: "How does the personalized styling work?",
      answer: "Our system recommends clothing based on your physical features—like gender, body shape, and skin tone—and your style preferences, such as fashion type and clothing category. It matches you with the best items from our collection and keeps learning to improve your recommendations over time."
    },
    {
      question: "Can I try on my own clothing items?",
      answer: 'Yes, you can! Simply select the "Direct Fitting" option after clicking the "Free Styling" button. This allows you to upload an image of your own clothing item and see how it looks on you'
    },
    {
      question: "What makes FYUSE different from other fashion platforms?",
      answer: 'FYUSE combines smart styling recommendations based on your body shape, skin tone, and preferences—with try-on tech that lets you see before you shop.'
    }
  ];

  // Toggle FAQ visibility
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Authentication and redirection logic
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      setIsRedirecting(true);
      localStorage.setItem('hasRegistered', 'true');

      if (!user) {
        setTimeout(() => {
          signinRedirect();
        }, 100);
      } else {
        router.push('/style-discovery');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/style-discovery');
    }
  };

  if (isRedirecting) {
    return <LoadingModalSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-grow font-body">
        {/* Hero Section*/}
        <section className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-13 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Single Centered Image Container with Fade Effect - Mobile Responsive */}
            <div className="relative overflow-hidden pb-3 flex justify-center">
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
              <button
                onClick={handleClick}
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mb-4 sm:mb-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Free Styling
              </button>
            </div>
          </div>
        </section>

        {/* Key Features Section*/}
        <section className="py-12 sm:py-20 bg-backround text-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
                Our Features
              </h2>
              <p className="font-body text-base sm:text-lg lg:text-xl text-primary/70 max-w-3xl mx-auto">
                Combining personalized styling with virtual try-on technology
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {keyFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 sm:p-8 bg-primary/5 backdrop-blur-sm rounded-2xl border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <Image 
                        src={feature.icon} 
                        alt={feature.title} 
                        width={80} 
                        height={80} 
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-4"
                      />
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-primary mb-2">
                        {feature.title}
                      </h3>
                      <p className="font-body text-sm sm:text-base text-primary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section*/}
        <section id="how-it-works" className="py-12 sm:py-24 bg-background text-primary relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-8 leading-tight tracking-tight">
                How FYUSE Works
              </h2>
              <p className="font-body text-base sm:text-lg lg:text-xl text-primary/70 max-w-3xl mx-auto leading-relaxed">
                Four simple steps to discover your perfect style
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {howItWorks.map((step, index) => (
                <div 
                  key={index}
                  className="
                    relative text-center p-6 sm:p-10 bg-primary/5 backdrop-blur-sm rounded-2xl
                    border border-primary/20 transition-all duration-300
                    hover:bg-primary/10 hover:shadow-2xl hover:scale-105
                    group
                  "
                >
                  <div className="
                    absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2
                    w-8 h-8 sm:w-12 sm:h-12 bg-primary text-primary-foreground rounded-full
                    flex items-center justify-center font-heading font-bold text-base sm:text-xl
                    shadow-xl
                  ">
                    {step.number}
                  </div>
                  
                  <div className="pt-4 sm:pt-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8">
                      <Image 
                        src={step.icon} 
                        alt={`Step ${step.number}: ${step.title}`} 
                        width={128} 
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <h3 className="font-heading text-lg sm:text-2xl font-bold text-primary mb-3 sm:mb-6 leading-tight">
                      {step.title}
                    </h3>
                    
                    <p className="font-body text-primary/70 text-sm sm:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section*/}
        <section className="py-12 sm:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
                FAQs
              </h2>
              <p className="font-body text-base sm:text-lg text-primary/70 max-w-2xl mx-auto">
                Everything you need to know about Fyuse
              </p>
            </div>

            <div className="space-y-4 py-5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-primary/10 rounded-2xl overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <button
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:bg-primary/5 transition-colors duration-200 font-ui"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-heading text-lg sm:text-xl font-semibold text-primary pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-primary transition-transform duration-200 flex-shrink-0 ${
                          openFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6 pt-4">
                      <p className="font-body text-base sm:text-lg text-primary/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section*/}
        <section className="py-12 sm:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-8 leading-tight tracking-tight">
              Ready to find your style?
            </h2>
            <p className="font-body text-base sm:text-lg lg:text-xl text-primary/80 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
              A personalized fashion experience, crafted for the few
              who seek more. Be among the first to explore it.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center sm:items-center">
              <button
                onClick={handleClick}
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mb-4 sm:mb-0 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Free Styling
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}