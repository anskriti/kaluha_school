"use client";

import { motion } from "framer-motion";
import { BookOpen, Check } from "lucide-react";

export default function SubjectsOffered() {
  const subjects = [
    { cat: "First Language", name: "Bengali (First Language)", desc: "Comprehensive language study, grammar, essay writing, and selections from Bengali poetry and literature." },
    { cat: "Second Language", name: "English (Second Language)", desc: "Functional grammar, reading comprehension, writing skills, and prose/poetry appreciation." },
    { cat: "Mathematics", name: "Mathematics", desc: "Algebra, Geometry, Arithmetic, Trigonometry, and Mensuration conforming to secondary board standards." },
    { cat: "Science", name: "Physical Science", desc: "Foundational physics and chemistry including light, heat, atomic structure, and chemical properties." },
    { cat: "Science", name: "Life Science", desc: "Plant physiology, human biology, genetics, evolution, and environmental science basics." },
    { cat: "Social Studies", name: "History", desc: "Ancient and modern Indian history, freedom struggle, and global history milestones." },
    { cat: "Social Studies", name: "Geography", desc: "Physical geography, Indian resources, West Bengal geography, map pointing, and weather patterns." },
    { cat: "Co-Curricular", name: "Computer Application & Work Education", desc: "Practical computer operations, word processing, basic programming, and vocational work projects." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Curriculum
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Subjects Offered (Classes V - X)
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 rounded-3xl border border-white shadow-xl mb-12 text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify"
      >
        <p>
          Kaluha Jagadishpur High School follows the official academic curriculum prescribed by the West Bengal Board of Secondary Education (WBBSE). Academic training is split into primary foundational blocks for Classes V-VIII and board preparatory schedules for Classes IX-X.
        </p>
      </motion.div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subj, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="p-5 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition flex gap-3 shadow-sm hover:border-school-blue/15"
          >
            <div className="p-1.5 bg-school-blue/5 text-school-blue rounded-lg h-fit flex-shrink-0">
              <Check size={14} className="text-school-gold" />
            </div>
            <div>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {subj.cat}
              </span>
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base mt-2 mb-1">
                {subj.name}
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium text-justify">
                {subj.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
