"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Award, ShieldAlert } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    {
      title: "Board Exam Toppers (Madhyamik)",
      desc: "Our Class X students consistently secure outstanding percentages. The 2025 Board results saw 98% pass out rate, with 3 regional toppers scoring above 92% marks.",
      icon: <Trophy className="text-amber-500" size={24} />
    },
    {
      title: "District Science Exhibition Winner",
      desc: "Secured first prize in the Birbhum District Science Fair 2024 for our innovative 'Solar Energy Water Filter and Rainwater Harvester' student model.",
      icon: <Award className="text-school-gold" size={24} />
    },
    {
      title: "Annual Sports Meet Football Champions",
      desc: "Won the Rampurhat Block-II High School Football Championship Trophy consecutively for 2023 and 2024.",
      icon: <Star className="text-school-blue" size={24} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Success Stories
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          School Achievements
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="flex flex-col gap-8">
        {achievements.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg flex flex-col sm:flex-row gap-5 items-start"
          >
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
