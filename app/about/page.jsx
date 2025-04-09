'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto space-y-14 font-sans">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            About FYUSE
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            FYUSE is here to make trying on clothes easy, fun, and truly about 'you' — no fitting rooms, no second guessing, just effortless style discovery.
          </p>
        </motion.div>

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold text-purple-300 mb-4">🌟 Our Vision</h2>
          <p className="text-base md:text-lg text-gray-300">
            We believe everyone deserves to feel good in what they wear. FYUSE reimagines how you explore outfits — making the experience personal, inspiring, and made for real life.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-purple-300 mb-4">🚀 What We Do for You</h2>
          <ul className="space-y-4 text-base md:text-lg text-gray-300 list-disc pl-5">
            <li>Let you try on clothes online, your way — no pressure, no mirrors, no awkward moments.</li>
            <li>Help you find what fits and flatters based on your look and style — not what the crowd wears.</li>
            <li>Give you outfit ideas that feel like you — not random ads or generic trends.</li>
            <li>Make it simple to compare, save, and revisit looks whenever inspiration strikes.</li>
            <li>Build your confidence and style over time — whether you're browsing, dressing up, or starting fresh.</li>
          </ul>
        </section>

        {/* Philosophy / Brand Essence */}
        <section>
          <h2 className="text-2xl font-bold text-purple-300 mb-4">🎨 Why We Care</h2>
          <p className="text-base md:text-lg text-gray-300">
            Style should be playful, expressive, and comfortable. FYUSE was created for people who want to feel good about what they wear — even before they own it.
          </p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-400">
            <li><span className="text-white">Clothes are personal:</span> So we make the experience feel personal too.</li>
            <li><span className="text-white">No pressure, just possibilities:</span> Try anything. Keep what works. Learn what feels right.</li>
            <li><span className="text-white">Your style, your pace:</span> Whether you're dressing up or discovering who you are, we're here for the journey.</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center pt-10">
          <Link href="/features" passHref>
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform text-lg">
              See What You Can Do →
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f0c29] border-t border-gray-700 py-8 text-center text-purple-200">
        <p>&copy; 2025 FYUSE. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="https://www.instagram.com/fyuse.id/" className="hover:text-white">Instagram</a>
        </div>
      </footer>
    </div>
  );
}
