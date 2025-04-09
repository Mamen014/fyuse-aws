'use client';
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";  

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
      "Every try-on is saved. Revisit your past looks, reflect on your style, and decide when you're ready. Your wardrobe, always with you — wherever you go.",
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
    className="bg-[#1d1a2e]/80 backdrop-blur-lg border border-purple-800/30 text-white rounded-2xl p-6 shadow-xl hover:shadow-purple-700/30 transition-all"
  >
    <h3 className="text-lg md:text-xl font-semibold text-purple-300 mb-3">{title}</h3>
    <p className="text-sm md:text-base text-gray-300">{description}</p>
  </motion.div>
);

export default function Features() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] py-20 px-6 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14 px-4">
          <motion.h2
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex justify-center items-center gap-2"
          >
            <Star className="w-7 h-7 text-purple-400" />
            More Than Features — A Whole New Way to Dress
          </motion.h2>
          <p className="mt-4 text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            FYUSE is where technology meets personal style. We go beyond tools — we help you feel confident, expressive, and effortlessly you.
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
  );
}
