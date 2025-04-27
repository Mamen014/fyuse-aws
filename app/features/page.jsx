"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    title: "Digital Fitting Room",
    description:
      "No more crowded malls or long fitting room lines. Try on clothes virtually from anywhere, anytime — whether you're on the couch or in a café. It's your private fitting room, reimagined. Today it’s image-based, tomorrow it’s live.",
  },
  {
    title: "Personalized Styling Recommendation",
    description:
      "Let our expert stylist pick outfits tailored to 'you'. Discover what flatters you most and get direct links to shop. Coming soon: shop directly from FYUSE for a seamless style-to-cart experience.",
  },
  {
    title: "Styling Tips",
    description:
      "Need a quick style boost? We suggest looks based on your body shape, skin tone, and vibe. Fashion advice that’s fast, friendly, and focused on 'you'.",
  },
  {
    title: "Digital Wardrobe",
    description:
      "Upload and organize your clothes, plan outfits virtually, and track what you wear to simplify your style and declutter with ease.",
  },
  {
    title: "Exclusive Outfits",
    description:
      "Get access to limited-edition outfits curated just for you. Premium pieces based on your taste, updated weekly. It’s your personal fashion vault.",
  },
  {
    title: "Wardrobe & Body Tracker",
    description:
      "Track your evolving style and body. Get smarter outfit suggestions as you grow and change. Fashion that fits you — always.",
  },
];

const FeatureCard = ({ title, description }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className="bg-background border border-cta/30 text-foreground rounded-2xl p-6 shadow-xl hover:shadow-cta/30 transition-all"
  >
    <h3 className="text-lg md:text-xl font-semibold text-cta mb-3">{title}</h3>
    <p className="text-sm md:text-base text-foreground">{description}</p>
  </motion.div>
);

export default function Features() {
  return (
    <div>
      <section className="min-h-screen bg-background py-20 px-6 text-foreground font-sans">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          {/* Header */}
          <div className="text-center mt-8 mb-14 px-4">
            <motion.h2
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary"
            >
              More Than Features — A Whole New Way to Dress
            </motion.h2>
            <p className="mt-4 text-base md:text-lg text-foreground max-w-2xl mx-auto">
              FYUSE is where technology meets personal style. We go beyond tools
              — we help you feel confident, expressive, and effortlessly you.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>
      <div className="bottom-0 left-0 right-0 bg-background py-8 px-2 flex justify-between items-center border-t border-primary">
          <Link href="/" passHref>
            <button
              type="button"
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="Back to Home"
            >
              ← Back to Home
            </button>
          </Link>
        </div>      
      <Footer />
    </div>
  );
}
