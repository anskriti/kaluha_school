"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Phone, CalendarRange } from "lucide-react";

export default function HOIDesk() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings?key=hoi_message")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMessage(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const defaultMessage = `Dear Students, Parents, and Well-wishers,

  It is my absolute privilege to welcome you all to the digital portal of Kaluha Jagadishpur High School. Our institution has been a beacon of learning in the Birbhum district of West Bengal since its humble establishment in 1961/1962.

  We believe that education is not merely the acquisition of textbook knowledge but the holistic development of character, moral integrity, creativity, and critical thinking. Our team of dedicated educators and support staff works tirelessly to provide a safe, nurturing, and stimulating environment where every child (from Class V to X) can discover and achieve their full potential.

  As a Government-Aided school, we strictly implement all student benefit schemes of the Government of West Bengal, including Kanyashree, Shikshashree, Sabooj Sathi, and the daily Mid-Day Meal program, ensuring that socio-economic barriers never obstruct a child's path to learning.

  We encourage our students to actively participate in co-curricular activities, science exhibitions, sports, and community outreach programs, cultivating a spirit of cooperation, empathy, and social responsibility.

  I thank our Managing Committee, Parent-Teacher Association, and local community members for their constant guidance and cooperation in our journey towards educational excellence.

  With warm regards,

  Teacher-in-Charge / Headmaster
  KALUHA JAGADISHPUR HIGH SCHOOL`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Page Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Administration
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          HOI Desk Message
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border border-white relative overflow-hidden"
      >
        {/* Background Emblem Watermark */}
        <div className="absolute top-10 right-10 opacity-5 pointer-events-none text-school-blue">
          <GraduationCap size={240} />
        </div>

        {/* Headmaster Header Meta */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/60 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-school-blue-light/10 text-school-blue-deep flex items-center justify-center font-bold text-xl border border-school-blue/20">
              HM
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Teacher-in-Charge / Headmaster</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Kaluha Jagadishpur High School</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex flex-col gap-1">
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-school-gold" />
              <span>kaluhajhighschool@gmail.com</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-school-gold" />
              <span>+91 9434582037</span>
            </span>
          </div>
        </div>

        {/* Message body */}
        <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium text-justify">
          {message || defaultMessage}
        </div>

        {/* Official stamp look */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col items-end text-right">
          <div className="w-32 h-10 border border-dashed border-red-500/20 text-red-500/40 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center rounded mb-2">
            Official Seal
          </div>
          <h4 className="font-black text-slate-800 text-sm">Headmaster Office</h4>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kaluha Jagadishpur High School</p>
        </div>
      </motion.div>
    </div>
  );
}
