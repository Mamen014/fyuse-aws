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
    status: "available",
  },
  {
    title: "Personalized Styling Recommendation",
    description:
      "Let our expert stylist pick outfits tailored to 'you'. Discover what flatters you most and get direct links to shop. Coming soon: shop directly from FYUSE for a seamless style-to-cart experience.",
    status: "available",
  },
  {
    title: "Digital Wardrobe",
    description:
      "Upload and organize your clothes, plan outfits virtually, and track what you wear to simplify your style and declutter with ease.",
    status: "coming_soon",
  },
  {
    title: "Exclusive Outfits",
    description:
      "Get access to limited-edition outfits curated just for you. Premium pieces based on your taste, updated weekly. It’s your personal fashion vault.",
    status: "coming_soon",
  },
  {
    title: "Wardrobe & Body Tracker",
    description:
      "Track your evolving style and body. Get smarter outfit suggestions as you grow and change. Fashion that fits you — always.",
    status: "coming_soon",
  },
];

const FeatureCard = ({ title, description, status }) => {
  const isComingSoon = status === "coming_soon";

  return (
    <motion.div
      whileHover={isComingSoon ? {} : { y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl p-6 border shadow-xl transition-all ${
        isComingSoon
          ? "bg-muted text-muted-foreground border-muted opacity-60 blur-[0.5px] cursor-default"
          : "bg-background text-foreground border-cta/30 hover:shadow-cta/30 cursor-pointer"
      }`}
    >
      {isComingSoon && (
        <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
          Coming Soon
        </span>
      )}
      <h3 className="text-lg md:text-xl font-semibold text-cta mb-3">{title}</h3>
      <p className="text-sm md:text-base">{description}</p>
    </motion.div>
  );
};

export default function Features() {
  const sortedFeatures = [
    ...features.filter((f) => f.status === "available"),
    ...features.filter((f) => f.status === "coming_soon"),
  ];

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
            <p className="mt-4 text-base md:text-lg max-w-2xl mx-auto">
              FYUSE is where technology meets personal style. We go beyond tools
              — we help you feel confident, expressive, and effortlessly you.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {sortedFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                status={feature.status}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
