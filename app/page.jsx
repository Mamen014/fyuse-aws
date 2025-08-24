"use client";

import { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAstyling from '@/components/ui/CTAstyling';

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(false);
  const stripRef = useRef(null);
  const [stripWidth, setStripWidth] = useState(0);

  useEffect(() => {
    if (stripRef.current) {
      setStripWidth(stripRef.current.scrollWidth / 2);
    }
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;

      // Hide if at top OR at bottom
      if (scrollY === 0 || scrollY + innerHeight >= scrollHeight - 50) {
        setShow(false);
      } else {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Brand logos for the featured brands section
  const logos = [
    { src: "/images/brand-logo/Adidas.png", alt: "Adidas" },
    { src: "/images/brand-logo/Bershka.png", alt: "Bershka" },
    { src: "/images/brand-logo/H&M.png", alt: "H&M" },
    { src: "/images/brand-logo/Massimo Dutti.png", alt: "Massimo Dutti" },
    { src: "/images/brand-logo/ZARA.png", alt: "ZARA" },
  ];

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
    }, 4000); // Change image every 2 seconds

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Back to Top Button */}
      <AnimatePresence>
        {show && (
          <motion.button
            key="backToTop"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80 transition"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
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
                  Find outfits that actually fit your body — in minutes
                </motion.h1>
                  
                {/* Sticky Wrapper */}
                <div className="w-full max-w-xs">
                  <CTAstyling />
                </div>
                  <p className="text-sm text-primary/70 mt-3">
                    Tell us your style, and get personalized looks instantly.
                    <br />
                    No guessing, no wasted shopping
                  </p> 
              </div>
            </div>
          </div>
        </section>

        {/* Featured Brands Section */}
        <section className="py-8 sm:py-12 bg-background text-primary overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                Featured Brands on FYUSE
              </h2>
              <p className="font-body text-sm sm:text-base text-primary/70 max-w-2xl mx-auto">
                Discover styles from top fashion brands featured in our recommendation system.
              </p>
            </div>

            {/* Brand Logos */}
            <div className="w-full overflow-hidden">
              <div
                className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-12 mx-auto"
              >
                {logos.map((logo, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={180}
                      height={90}
                      className="object-contain h-auto w-16 sm:w-32 md:w-40 lg:w-44 
                                mx-auto scale-90 hover:scale-100 transition-transform duration-300"
                    />
                  </div>
                ))}
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
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid sm:grid-cols-2 gap-6 sm:gap-10"
            >
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
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
            </motion.div>
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

            {/* Animated Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
            >
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  variants={item}
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
                    <div
                      className="
                        w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-900 to-slate-900 text-white
                        rounded-full flex items-center justify-center font-heading font-bold text-base sm:text-xl
                        shadow-md ring-4 ring-background z-10
                      "
                    >
                      {step.number}
                    </div>
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
            </motion.div>
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

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border rounded-2xl shadow-sm"
                >
                  <AccordionTrigger className="text-left px-4 py-3 font-medium text-base sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
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
              <CTAstyling/>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}