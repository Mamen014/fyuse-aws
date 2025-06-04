"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto space-y-14 font-sans">
        <Navbar />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
            About FYUSE
          </h1>
          <p className="mt-4 text-lg text-foreground max-w-3xl mx-auto">
            FYUSE is here to make trying on clothes easy, fun, and truly about
            'you' — no fitting rooms, no second guessing, just effortless style
            discovery.
          </p>
        </motion.div>

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold text-cta mb-4">Our Vision</h2>
          <p className="text-base md:text-lg text-foreground">
            We believe everyone deserves to feel good in what they wear. FYUSE
            reimagines how you explore outfits — making the experience personal,
            inspiring, and made for real life.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-cta mb-4">
            What We Do for You
          </h2>
          <ul className="space-y-4 text-base md:text-lg text-foreground list-disc pl-5">
            <li>
              Let you try on clothes online, your way — no pressure, no mirrors,
              no awkward moments.
            </li>
            <li>
              Help you find what fits and flatters based on your look and style
              — not what the crowd wears.
            </li>
            <li>
              Give you outfit ideas that feel like you — not random ads or
              generic trends.
            </li>
            <li>
              Make it simple to compare, save, and revisit looks whenever
              inspiration strikes.
            </li>
            <li>
              Build your confidence and style over time — whether you're
              browsing, dressing up, or starting fresh.
            </li>
          </ul>
        </section>

        {/* Philosophy / Brand Essence */}
        <section>
          <h2 className="text-2xl font-bold text-cta mb-4">Why We Care</h2>
          <p className="text-base md:text-lg text-foreground">
            Style should be playful, expressive, and comfortable. FYUSE was
            created for people who want to feel good about what they wear — even
            before they own it.
          </p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-foreground">
            <li>
              <span className="font-semibold text-primary">
                Clothes are personal:
              </span>{" "}
              So we make the experience feel personal too.
            </li>
            <li>
              <span className="font-semibold text-primary">
                No pressure, just possibilities:
              </span>{" "}
              Try anything. Keep what works. Learn what feels right.
            </li>
            <li>
              <span className="font-semibold text-primary">
                Your style, your pace:
              </span>{" "}
              Whether you're dressing up or discovering who you are, we're here
              for the journey.
            </li>
          </ul>
        </section>

        {/* CTA */}
        {/* <div className="bottom-0 left-0 right-0 bg-background py-8 px-2 flex justify-between items-center border-t border-primary"> */}
        {/* Back to Home (Arrow Icon) */}
        {/* <Link href="/" passHref>
            <button
              type="button"
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="Back to Home"
            >
              ← Back to Home
            </button>
          </Link> */}

        {/* Link to /features */}
        {/* <Link href="/features" passHref>
            <button
              type="button"
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="View Features Page"
            >
              View Features →
            </button>
          </Link> */}
        {/* </div> */}
      </main>

      <Footer />
    </div>
  );
}
