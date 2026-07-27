"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingItem {
  id: number;
  type: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
}

const itemTypes = [
  "book",
  "pen",
  "cap",
  "bulb",
  "plane",
  "atom",
  "math",
  "bell",
  "pencil",
  "ruler"
];

export default function FloatingObjects() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // Generate random items once on client mount to avoid hydration mismatch
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: itemTypes[i % itemTypes.length],
      x: Math.random() * 90 + 5, // percentage positioning
      y: Math.random() * 90 + 5,
      scale: Math.random() * 0.4 + 0.4,
      opacity: Math.random() * 0.15 + 0.05,
      duration: Math.random() * 20 + 15, // float speeds
      delay: Math.random() * -20 // start negative to prevent staggered startup
    }));
    setItems(generated);
  }, []);

  const renderIcon = (type: string) => {
    switch (type) {
      case "book":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10M6 10h10M6 14h10" strokeLinecap="round" />
          </svg>
        );
      case "pen":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="m18 2 4 4L9 21H5v-4L18 2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 5 4 4" strokeLinecap="round" />
          </svg>
        );
      case "cap":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "bulb":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" strokeLinecap="round" />
            <path d="M9 18h6M10 22h4M9 15h6" strokeLinecap="round" />
          </svg>
        );
      case "plane":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="m22 2-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m22 2-11 11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "atom":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <circle cx="12" cy="12" r="2" />
            <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)" />
            <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)" />
            <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)" />
          </svg>
        );
      case "math":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M4 12h6M4 15h6M16 6l-6 12M10 6l6 12M15 12h5M17.5 9.5v5" strokeLinecap="round" />
          </svg>
        );
      case "bell":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "pencil":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        );
      case "ruler":
        return (
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current" strokeWidth="1.5">
            <path d="m5 5 14 14M5 9l2-2M8 12l2-2M11 15l2-2M14 18l2-2" strokeLinecap="round" />
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-school-blue-light/40"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
          initial={{
            y: 0,
            rotate: 0,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            rotate: [0, 360],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          <div
            style={{
              transform: `scale(${item.scale})`,
              opacity: item.opacity,
            }}
          >
            {renderIcon(item.type)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
