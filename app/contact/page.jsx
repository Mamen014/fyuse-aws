"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Contact() {
  return (
    <div>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto font-sans space-y-12">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Contact FYUSE
            </h1>
            <p className="mt-4 text-lg text-foreground max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hi? We’d love to
              hear from you!
            </p>
          </motion.div>

          {/* Send Us an Email Button */}
          <div className="flex justify-center mb-8">
            <a
              href="mailto:ryaniaska14@gmail.com"
              className="bg-cta hover:bg-primary text-cta-foreground px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform text-lg"
            >
              Send Us an Email 📩
            </a>
          </div>

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background border border-cta rounded-2xl shadow-xl p-8 space-y-6"
          >
            <h2 className="text-2xl font-semibold text-primary">
              Get in Touch
            </h2>

            <div className="space-y-4 text-lg text-foreground">
              <p>
                <span className="font-semibold text-primary">
                  Contact Person:
                </span>{" "}
                Ryan Iaska, Founder of FYUSE
              </p>
              <p>
                <span className="font-semibold text-primary">Email:</span>{" "}
                <a
                  href="mailto:ryaniaska14@gmail.com"
                  className="text-cta hover:underline"
                >
                  ryaniaska14@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-primary">WhatsApp:</span>{" "}
                <a
                  href="https://wa.me/6281384481108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cta hover:underline"
                >
                  +62 813 8448 1108
                </a>
              </p>
            </div>
          </motion.div>

          {/* Back to Home (Arrow Icon) */}
          {/* <Link href="/" passHref>
            <button
              type="button"
              className="text-foreground text-lg hover:text-cta transition-colors flex items-center gap-2"
              aria-label="Back to Home"
            >
              ← Back to Home
            </button>
          </Link> */}
        </main>
      </div>
      <Footer />
    </div>
  );
}
