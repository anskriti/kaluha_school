"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-school-blue-deep text-white"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.4)_0%,rgba(11,37,69,1)_100%)]" />

          {/* Glassmorphic Loading Centerpiece */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="z-10 flex flex-col items-center justify-center p-8 rounded-3xl glass-panel-dark max-w-md w-11/12 text-center"
          >
            {/* Spinning Golden Logo Rim */}
            <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-school-gold"
              />
              {/* Outer Pulse */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border-2 border-school-gold/30"
              />
              {/* School Logo */}
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/80 bg-white flex items-center justify-center relative">
                {/* Fallback school logo representation */}
                <img
                  src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/31776.jpg"
                  alt="Kaluha Jagadishpur HS Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to text inside if image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-school-blue-deep font-bold text-xs text-center px-1">KJHS 1961</span>
              </div>
            </div>

            {/* Title & Typing Welcome */}
            <h1 className="text-xl font-bold tracking-wider text-school-gold mb-2">
              KALUHA JAGADISHPUR HIGH SCHOOL
            </h1>
            <p className="text-xs text-slate-300 mb-6 uppercase tracking-widest font-mono h-4">
              Welcome to the Official Portal
            </p>

            {/* Loading Bar Container */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-3 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="h-full bg-gradient-to-r from-school-gold to-yellow-300 rounded-full"
              />
            </div>

            {/* Percentage Display */}
            <span className="text-sm font-semibold text-school-gold font-mono">
              {progress > 100 ? 100 : progress}%
            </span>
          </motion.div>

          {/* Government School Emblem Footer */}
          <div className="absolute bottom-8 text-center text-[10px] uppercase tracking-widest text-slate-400 z-10">
            Govt. of West Bengal • Established 1961
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
