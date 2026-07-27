"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Award, Building, BookOpen } from "lucide-react";

export default function SchoolHistory() {
  const [historyText, setHistoryText] = useState("");

  useEffect(() => {
    fetch("/api/settings?key=school_history")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setHistoryText(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const defaultHistory = "Kaluha Jagadishpur High School was established in 1962 (as per historical records, with the official emblem showing the establishment year of 1961) by local educationists and philanthropists who felt the pressing need for a secondary school in the remote agrarian villages of Margram and Kaluha in Birbhum district. Over the decades, it has grown from a humble clay structure to a two-story facility, providing secondary education (classes V to X) under the West Bengal Board of Secondary Education (WBBSE).";

  const timeline = [
    {
      year: "1961-1962",
      title: "The Founding",
      desc: "Founded as an informal assembly under local community initiatives to provide secondary instruction to agricultural village kids.",
      icon: <Calendar size={18} />
    },
    {
      year: "1985",
      title: "Government Recognition",
      desc: "Granted official Aided Recognition from the Government of West Bengal and WBBSE, allowing formal registration of students.",
      icon: <Award size={18} />
    },
    {
      year: "2010",
      title: "Building Expansion",
      desc: "Constructed the secondary concrete building, creating classrooms, library space, and dedicated administrative offices.",
      icon: <Building size={18} />
    },
    {
      year: "2018",
      title: "ICT Computer Lab",
      desc: "Inaugurated the computer literacy center with internet and digital smart projectors for audio-visual classes.",
      icon: <BookOpen size={18} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Our Heritage
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          School History & Origin
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-8 md:p-10 shadow-xl border border-white mb-12"
      >
        <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium text-justify">
          {historyText || defaultHistory}
        </p>
      </motion.div>

      {/* Vertical Timeline */}
      <h3 className="text-lg font-extrabold text-school-blue-deep uppercase tracking-wider mb-8 text-center">
        Milestones Timeline
      </h3>

      <div className="relative border-l border-slate-200/80 ml-4 md:ml-32">
        {timeline.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="mb-10 ml-6 relative"
          >
            {/* Circle timeline dot */}
            <span className="absolute -left-10 top-0.5 bg-school-blue text-white rounded-full p-2 border-4 border-slate-50 flex items-center justify-center shadow-lg">
              {item.icon}
            </span>

            <div className="glass-panel bg-white/70 p-6 rounded-2xl border border-white shadow-md">
              <span className="text-xs font-black text-school-gold tracking-widest uppercase font-mono bg-school-gold/10 px-2 py-0.5 rounded">
                {item.year}
              </span>
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base mt-2 mb-1">
                {item.title}
              </h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
