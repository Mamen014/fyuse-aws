'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  const [show, setShow] = useState(false);

  // Delay showing the loading indicator to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
