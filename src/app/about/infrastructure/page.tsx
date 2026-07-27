"use client";

import { motion } from "framer-motion";
import { Building, Monitor, BookOpen, Heart, Shield, Award } from "lucide-react";

export default function SchoolInfrastructure() {
  const infraItems = [
    {
      title: "Active Classrooms",
      desc: "12 spacious, well-ventilated classrooms with study benches, boards, and adequate electrical fixtures, providing a comfortable learning environment for classes V to X.",
      icon: <Building size={20} />
    },
    {
      title: "ICT Computer Laboratory",
      desc: "A dedicated computer literacy room containing standard desktop terminals, internet availability, and an audio-visual digital projector for digital smart learning.",
      icon: <Monitor size={20} />
    },
    {
      title: "Physical & Life Sciences Lab",
      desc: "Equipped with basic experimental apparatus, microscopes, slides, reagents, and measurement scales, facilitating scientific experiments and practical syllabus work.",
      icon: <Shield size={20} />
    },
    {
      title: "Institution Library",
      desc: "An archive holding over 1,000 reference guides, textbooks, regional journals, storybooks, and reference encyclopedias, along with a quiet reading layout.",
      icon: <BookOpen size={20} />
    },
    {
      title: "Playground & Sports Field",
      desc: "A spacious green campus turf in front of the building, providing area for daily assemblies, drills, football matches, cricket nets, and annual athletics events.",
      icon: <Award size={20} />
    },
    {
      title: "Sanitation & Pure Water",
      desc: "Equipped with multi-stage water filtration units for drinking water, and separate, well-maintained sanitation facilities for boys, girls, and faculty members.",
      icon: <Heart size={20} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Campus Features
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Our Infrastructure
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      {/* Building overview from image description */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel bg-white/70 p-6 md:p-8 rounded-3xl border border-white shadow-xl mb-12 flex flex-col md:flex-row gap-6 items-center"
      >
        <div className="w-full md:w-2/5 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/400319.jpg"
            alt="School Building View"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-school-blue to-school-blue-deep flex items-center justify-center text-white font-bold text-xs p-4 text-center">
            School Main Building (White & Blue Theme)
          </div>
        </div>
        <div className="w-full md:w-3/5 text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
          <h3 className="font-extrabold text-slate-800 text-base mb-2">School Main Building</h3>
          <p>
            Kaluha Jagadishpur High School operates in a spacious, concrete multi-story building painted in clean white and blue borders. The campus features a large grassy playground directly in front of the main building, accessed through a secure blue-painted iron gate. The boundary is secure, ensuring a protected and peaceful school environment for all learners.
          </p>
        </div>
      </motion.div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {infraItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="p-6 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md flex flex-col gap-3"
          >
            <div className="p-2.5 bg-school-blue/5 text-school-blue rounded-xl w-fit">
              {item.icon}
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
              {item.title}
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed font-medium text-justify">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
