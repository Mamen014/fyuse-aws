'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAstyling from '@/components/ui/CTAstyling';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-6 max-w-5xl mx-auto space-y-14 font-body">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary leading-tight tracking-tight">
            About FYUSE
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            FYUSE is here to make trying on clothes easy, fun, and truly about
            <em> you</em> — no fitting rooms, no second guessing, just effortless style discovery.
          </p>
          <CTAstyling />
        </motion.div>
        {/* Vision */}
        <section>
          <h2 className="text-3xl font-heading font-semibold text-primary mb-4 tracking-tight">
            Our Vision
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            We believe everyone deserves to feel good in what they wear. FYUSE
            reimagines how you explore outfits — making the experience personal,
            inspiring, and made for real life.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-3xl font-heading font-semibold text-primary mb-4 tracking-tight">
            What We Do for You
          </h2>
          <ul className="space-y-4 text-base md:text-lg leading-relaxed list-disc pl-5">
            <li>
              Let you try on clothes online, your way — no pressure, no mirrors, no awkward moments.
            </li>
            <li>
              Help you find what fits and flatters based on your look and style — not what the crowd wears.
            </li>
            <li>
              Give you outfit ideas that feel like you — not random ads or generic trends.
            </li>
            <li>
              Make it simple to compare, save, and revisit looks whenever inspiration strikes.
            </li>
            <li>
              Build your confidence and style over time — whether you&apos;re browsing, dressing up, or starting fresh.
            </li>
          </ul>
        </section>

        {/* Brand Essence */}
        <section>
          <h2 className="text-3xl font-heading font-semibold text-primary mb-4 tracking-tight">
            Why We Care
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            Style should be playful, expressive, and comfortable. FYUSE was created for people who want to feel good
            about what they wear — even before they own it.
          </p>
          <ul className="mt-4 space-y-4 list-disc pl-5 text-base md:text-lg leading-relaxed">
            <li>
              <span className="font-semibold text-primary">Clothes are personal:</span>{' '}
              So we make the experience feel personal too.
            </li>
            <li>
              <span className="font-semibold text-primary">No pressure, just possibilities:</span>{' '}
              Try anything. Keep what works. Learn what feels right.
            </li>
            <li>
              <span className="font-semibold text-primary">Your style, your pace:</span>{' '}
              Whether you&apos;re dressing up or discovering who you are, we&apos;re here for the journey.
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
