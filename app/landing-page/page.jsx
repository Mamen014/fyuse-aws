"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      src: "/images/hero-image/model1.png",
      alt: "Person 1"
    },
    {
      id: 2, 
      src: "/images/hero-image/model2.png",
      alt: "Person 2"
    },
    {
      id: 3,
      src: "/images/hero-image/model3.png",
      alt: "Person 3"
    },
        {
      id: 4,
      src: "/images/hero-image/model4.png",
      alt: "Person 4"
    },
        {
      id: 5,
      src: "/images/hero-image/model5.png",
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
      title: "Discover Your Style",
      description: "Discover outfit recommendations tailored to your body shape, skin tone, and styling preference"
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
      question: "Is FYUSE free to use?",
      answer: "Yes! You can start using FYUSE for free with access to a limited number of styling recommendations. Upgrade to a premium plan to unlock more style suggestions and try-on sessions."
    },
    {
      question: "How do I get started?",
      answer: "Just click the 'Start Free Styling' button and answer a few quick questions. You’ll get curated looks and see how it fits on you."
    },
    {
      question: "How does the personalized styling work?",
      answer: "Our system recommends clothing based on your physical features—like gender, body shape, and skin tone—and your style preferences, such as fashion type and clothing category. It matches you with the best items from our collection and keeps learning to improve your recommendations over time."
    },
    {
      question: "What if I don’t like the recommendations?",
      answer: "You can update your preferences anytime to get new suggestions. FYUSE learns from your likes to refine your style profile continuously."
    },
    {
      question: "How can I get the clothing item?",
      answer: "You can visit the product detail page of any FYUSE-recommended item to view, learn more, and purchase it."
    },
    {
      question: "What makes FYUSE different from other fashion platforms?",
      answer: 'FYUSE combines smart styling recommendations based on your body shape, skin tone, and preferences—with try-on tech that lets you see before you shop.'
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We only collect what we need—your photos and style choices—to style you better. Your data is locked away in secure cloud storage, never sold, and only shared with trusted partners when the law requires. You can view, update, or delete it at any time."
    }    
  ];

  // Toggle FAQ visibility
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Authentication and redirection logic
  const handleClickTop = async (e) => {
    e.preventDefault();
    try {
      setIsRedirecting(true);
      track('Start_Free_Styling', 'top')
      localStorage.setItem('from', 'landing-page');
      localStorage.setItem('hasRegistered', 'true');
      localStorage.setItem('showRegister', 'true');
      localStorage.setItem('seeReferral', 'true');      

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

  // Authentication and redirection logic
  const handleClickBottom = async (e) => {
    e.preventDefault();
    try {
      setIsRedirecting(true);
      track('Start_Free_Styling', 'bottom')
      localStorage.setItem('from', 'landing-page');
      localStorage.setItem('hasRegistered', 'true');
      localStorage.setItem('showRegister', 'true');
      localStorage.setItem('seeReferral', 'true');      

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

  // Tracker selection
  const track = async (action, metadata = {}) => {
    if (!userEmail) return;
    try {
      await axios.post(`${API_BASE_URL}/trackevent`, {
        userEmail,
        action,
        timestamp: new Date().toISOString(),
        page: 'LandingPage',
        ...metadata,
      });
    } catch (err) {
      console.error('Tracking failed:', err.message);
    }
  };

  // If redirecting, show loading spinner
  if (isRedirecting) {
    return <LoadingModalSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <main className="flex-grow font-body">
       
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 sm:pt-28 pb-8 sm:pb-13 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Flex container for responsive layout */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              
              {/* Image Container */}
              <div className="flex justify-center sm:justify-start w-full sm:w-1/2">
                <div className="relative w-[300px] sm:w-[450px] h-[400px] sm:h-[600px]">
                  {/* Glowing background */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/30 via-purple-500/20 to-indigo-400/30 blur-2xl rounded-3xl z-[-1]" />

                  {/* Fading Carousel */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroImages[currentIndex].id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={heroImages[currentIndex].src}
                        alt={heroImages[currentIndex].alt}
                        priority
                        fill
                        className="rounded-2xl object-cover"
                        sizes="(max-width: 640px) 300px, 450px"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* CTA Section */}
              <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start text-center sm:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl sm:text-3xl font-semibold text-primary mt-6 sm:mt-0 leading-snug max-w-xs sm:max-w-md"
                >
                  Smart fashion. <br className="hidden sm:block" />Made to fit you perfectly.
                </motion.h1>

                <button
                  onClick={handleClickTop}
                  className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full w-full max-w-xs sm:max-w-sm text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mt-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-md"
                >
                  Start Free Styling
                </button>

                <p className="text-sm text-primary/70 mt-3">
                  Made for professionals like you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Feature Section */}
        <section className="py-10 sm:py-24 bg-background text-primary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                Our Powerful Combination
              </h2>
              <p className="font-body text-base sm:text-lg lg:text-xl text-primary/70 max-w-3xl mx-auto leading-relaxed">
                Personalized styling meets cutting-edge virtual try-on — saving you time and helping you stand out.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="
                    p-6 sm:p-8 bg-background backdrop-blur-md rounded-3xl
                    border border-primary/30
                    transition-all duration-300
                    hover:scale-[1.03] hover:shadow-2xl hover:ring-1 hover:ring-primary/40
                    shadow-[0_15px_30px_-10px_rgba(0,0,0,0.25)]
                    group
                  "
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Animated Icon Wrapper */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ duration: 0.3 }}
                        className="
                          w-16 h-16 sm:w-20 sm:h-20 mb-4
                          flex items-center justify-center rounded-xl
                        "
                      >
                        <Image
                          src={feature.icon}
                          alt={feature.title}
                          width={80}
                          height={80}
                          className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                        />
                      </motion.div>


                    {/* Feature Title + Description */}
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-semibold text-primary mb-2 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="font-body text-sm sm:text-base text-primary/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section*/}
        <section id="how-it-works" className="py-6 sm:py-24 bg-background text-primary relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-8 leading-tight tracking-tight">
                How FYUSE Works
              </h2>
              <p className="font-body text-base sm:text-lg lg:text-xl text-primary/70 max-w-3xl mx-auto leading-relaxed">
                Three simple steps to discover your perfect style
              </p>
            </div>

            {/* Responsive Grid with 3 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="
                    relative text-center px-6 sm:px-8 pt-6 pb-8
                    bg-white/10 backdrop-blur-md
                    rounded-3xl border border-primary/30
                    transition-all duration-300 hover:scale-[1.03] hover:shadow-xl
                    group
                  "
                >
                  {/* Step Number Badge */}
                  <div className="flex justify-center mb-4 -mt-10">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                      viewport={{ once: true }}
                      className="
                        w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-900 to-slate-900 text-white
                        rounded-full flex items-center justify-center font-heading font-bold text-base sm:text-xl
                        shadow-md ring-4 ring-background z-10
                      "
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Step Content */}
                  <div className="pt-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-8"
                    >
                      <Image
                        src={step.icon}
                        alt={`Step ${step.number}: ${step.title}`}
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>

                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-primary mb-3 leading-snug">
                      {step.title}
                    </h3>

                    <p className="font-body text-sm sm:text-base text-primary/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section*/}
        <section className="py-10 sm:py-24 bg-background text-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* FAQ Header */}
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                FAQs
              </h2>
              <p className="font-body text-base sm:text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about FYUSE before getting started.
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-5">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-primary/20 backdrop-blur-md rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between text-left p-6 sm:p-7 focus:outline-none group"
                  >
                    <h3 className="font-heading text-base sm:text-lg md:text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors duration-200 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {openFAQ === index && (
                      <motion.div
                        key="answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="px-6 pb-6 sm:px-7 sm:pb-7"
                      >
                        <p className="font-body text-sm sm:text-base text-primary/70 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section*/}
        <section className="py-6 sm:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-8 leading-tight tracking-tight">
              Ready to find your style?
            </h2>
            <p className="font-body text-base sm:text-lg lg:text-xl text-primary/80 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
              A personalized fashion experience, crafted for the few
              who seek more. Be among the first to explore it.
            </p>
            <div className="space-y-4 max-w-xs w-full mx-auto sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center sm:items-center">
              <button
                onClick={handleClickBottom}
                className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold transition-all duration-300 shadow-xl mb-4 sm:mb-0 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 hover:shadow-md"
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