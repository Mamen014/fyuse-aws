'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto font-sans space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Contact FYUSE
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hi? We’d love to hear from you!
          </p>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1f1b3a] rounded-2xl shadow-xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-semibold text-purple-300">Get in Touch</h2>

          <div className="space-y-4 text-lg text-gray-300">
            <p><span className="font-semibold text-white">Contact Person:</span> Ryan Iaska, Founder of FYUSE</p>
            <p>
              <span className="font-semibold text-white">Email:</span>{' '}
              <a href="mailto:ryaniaska14@gmail.com" className="text-purple-400 hover:underline">
                ryaniaska14@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold text-white">WhatsApp:</span>{' '}
              <a
                href="https://wa.me/6281384481108"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                +62 813 8448 1108
              </a>
            </p>
          </div>
        </motion.div>

        {/* Optional CTA */}
        <div className="text-center pt-10">
          <a
            href="mailto:ryaniaska14@gmail.com"
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Send Us an Email 📩
          </a>
        </div>
      </main>

      <footer className="bg-[#0f0c29] border-t border-gray-700 py-8 text-center text-purple-200">
        <p>&copy; 2025 FYUSE. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-6">
          <a href="https://www.instagram.com/fyuse.id/" className="hover:text-white">Instagram</a>
        </div>
      </footer>
    </div>
  );
}
