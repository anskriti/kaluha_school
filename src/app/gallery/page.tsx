"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Video as VideoIcon, X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface GalleryItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  category: string;
  title: string;
  url: string;
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ["ALL", "CAMPUS", "LIBRARY", "LABORATORY", "SMART_CLASS", "EVENTS"];

  const items: GalleryItem[] = [
    {
      id: "1",
      type: "IMAGE",
      category: "CAMPUS",
      title: "School Building",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/400319.jpg"
    },
    {
      id: "2",
      type: "IMAGE",
      category: "EVENTS",
      title: "Vivekananda anniversary",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/162125.jpg"
    },
    {
      id: "3",
      type: "IMAGE",
      category: "CAMPUS",
      title: "School Garden work",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/541870.jpeg"
    },
    {
      id: "4",
      type: "IMAGE",
      category: "LIBRARY",
      title: "Reading Hall",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/886050.jpeg"
    },
    {
      id: "5",
      type: "IMAGE",
      category: "LIBRARY",
      title: "Book shelves",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/644464.jpeg"
    },
    {
      id: "6",
      type: "IMAGE",
      category: "EVENTS",
      title: "Bigyan Mela",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/974565.jpeg"
    },
    {
      id: "7",
      type: "IMAGE",
      category: "SMART_CLASS",
      title: "ICT Computer Class",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/704763.jpg"
    },
    {
      id: "8",
      type: "IMAGE",
      category: "CAMPUS",
      title: "Annual Sports Field",
      url: "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/735275.jpeg"
    },
    {
      id: "9",
      type: "VIDEO",
      category: "EVENTS",
      title: "Gardening Activity video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-children-in-school-uniform-raising-hands-33513-large.mp4"
    }
  ];

  const filteredItems = activeTab === "ALL" 
    ? items 
    : items.filter(item => item.category === activeTab);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => {
      if (prev === null) return null;
      return prev === 0 ? filteredItems.length - 1 : prev - 1;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => {
      if (prev === null) return null;
      return (prev + 1) % filteredItems.length;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Media
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Photo & Video Gallery
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === cat
                ? "bg-school-blue text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => setLightboxIndex(idx)}
            className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer border border-slate-100 bg-white aspect-[4/3] flex items-center justify-center"
          >
            {item.type === "IMAGE" ? (
              <>
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 text-white">
                  <ImageIcon size={18} className="text-school-gold mb-2" />
                  <h4 className="font-bold text-xs uppercase tracking-wide">{item.title}</h4>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">{item.category}</p>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                {/* Fallback image representing video */}
                <div className="absolute inset-0 opacity-40">
                  <img
                    src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/974565.jpeg"
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="z-10 flex flex-col items-center gap-2 text-white">
                  <div className="p-4 bg-school-gold text-school-blue-deep rounded-full shadow-lg">
                    <Play size={20} fill="currentColor" />
                  </div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-center px-4 mt-2">{item.title}</h4>
                  <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Video</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Left Nav */}
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Nav */}
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50 cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>

            {/* Content box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center justify-center relative cursor-default"
            >
              {filteredItems[lightboxIndex].type === "IMAGE" ? (
                <img
                  src={filteredItems[lightboxIndex].url}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <video
                  src={filteredItems[lightboxIndex].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
                />
              )}

              <div className="text-center text-white mt-4 flex flex-col gap-1">
                <h4 className="font-extrabold text-sm uppercase tracking-wide">
                  {filteredItems[lightboxIndex].title}
                </h4>
                <p className="text-[10px] text-school-gold font-bold uppercase tracking-widest">
                  {filteredItems[lightboxIndex].category}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
