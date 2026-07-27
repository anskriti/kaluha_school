"use client";

import { motion } from "framer-motion";
import { Compass, Target, Heart, Check } from "lucide-react";

export default function VisionMission() {
  const coreValues = [
    { title: "Inclusivity", desc: "Providing equal opportunities to students of all socio-economic backgrounds." },
    { title: "Integrity", desc: "Instilling moral discipline, honesty, and civic responsibility." },
    { title: "Innovation", desc: "Blending classic learning with digital literacy and computer education." },
    { title: "Excellence", desc: "Striving for high academic performance and success in board examinations." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Core Principles
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Vision & Mission
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-3xl p-8 shadow-xl border border-white flex flex-col gap-4"
        >
          <div className="p-3 bg-school-gold/10 text-school-gold-dark rounded-2xl w-fit">
            <Compass size={28} />
          </div>
          <h3 className="text-xl font-extrabold text-school-blue-deep uppercase tracking-wide">
            Our Vision
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
            To be a leading secondary institution in rural Birbhum, recognized for nurturing academic excellence, digital literacy, and strong ethical values. We envision our graduates as confident, skilled, and socially conscious citizens who contribute meaningfully to the progress of West Bengal and the nation.
          </p>
        </motion.div>

        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-panel rounded-3xl p-8 shadow-xl border border-white flex flex-col gap-4"
        >
          <div className="p-3 bg-school-blue/10 text-school-blue rounded-2xl w-fit">
            <Target size={28} />
          </div>
          <h3 className="text-xl font-extrabold text-school-blue-deep uppercase tracking-wide">
            Our Mission
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
            To deliver an inspiring, accessible, and structured secondary curriculum (Classes V to X) that promotes critical thinking, practical science experience, and sportsmanship. We commit to implementing all West Bengal state student welfare programs and fostering a supportive community for rural children.
          </p>
        </motion.div>
      </div>

      {/* Core Values Section */}
      <h3 className="text-lg font-extrabold text-school-blue-deep uppercase tracking-wider mb-6 text-center">
        Our Core Values
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coreValues.map((value, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-5 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition flex gap-3"
          >
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg h-fit">
              <Check size={16} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{value.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed mt-1 font-medium">{value.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
