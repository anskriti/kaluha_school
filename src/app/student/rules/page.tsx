"use client";

import { motion } from "framer-motion";
import { Clock, ShieldAlert, Award, BookOpen } from "lucide-react";

export default function SchoolRules() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Discipline
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Rules & Regulations
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="flex flex-col gap-10">
        {/* Section 1: School Timings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg flex gap-4"
        >
          <div className="p-3.5 bg-school-blue/5 text-school-blue rounded-2xl h-fit">
            <Clock size={22} className="text-school-gold" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base uppercase tracking-wider mb-3">
              Official School Timings
            </h3>
            <ul className="text-xs md:text-sm text-slate-600 leading-relaxed flex flex-col gap-2 font-medium">
              <li>• <span className="font-bold text-slate-800">Prayer / Assembly: </span>Starts at 10:40 AM daily. Attendance is compulsory for all students.</li>
              <li>• <span className="font-bold text-slate-800">Weekday Classes (Mon - Fri): </span>10:50 AM to 4:30 PM (with Recess/Mid-day Meal at 1:30 PM).</li>
              <li>• <span className="font-bold text-slate-800">Saturday Classes: </span>10:50 AM to 1:30 PM (Half day, no recess).</li>
            </ul>
          </div>
        </motion.div>

        {/* Section 2: School Uniform */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg flex gap-4"
        >
          <div className="p-3.5 bg-school-blue/5 text-school-blue rounded-2xl h-fit">
            <Award size={22} className="text-school-gold" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base uppercase tracking-wider mb-3">
              School Uniform Code
            </h3>
            <ul className="text-xs md:text-sm text-slate-600 leading-relaxed flex flex-col gap-2 font-medium">
              <li>• <span className="font-bold text-slate-800">Boys (V - X): </span>White shirt, Navy Blue shorts (Classes V-VIII) or Navy Blue trousers (Classes IX-X), school badge, black leather shoes, and white socks.</li>
              <li>• <span className="font-bold text-slate-800">Girls (V - X): </span>White frock/gown with Navy Blue sash/apron, or Navy Blue salwar suit with white dupatta as prescribed by WBBSE guidelines.</li>
            </ul>
          </div>
        </motion.div>

        {/* Section 3: Code of Conduct */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 md:p-8 rounded-3xl border border-slate-100 bg-white shadow-lg flex gap-4"
        >
          <div className="p-3.5 bg-school-blue/5 text-school-blue rounded-2xl h-fit">
            <ShieldAlert size={22} className="text-school-gold" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base uppercase tracking-wider mb-3">
              General Code of Conduct
            </h3>
            <ul className="text-xs md:text-sm text-slate-600 leading-relaxed flex flex-col gap-2 font-medium">
              <li>• <span className="font-bold text-slate-800">Minimum Attendance: </span>Every student must maintain at least 75% attendance during the academic session to qualify for term examinations.</li>
              <li>• <span className="font-bold text-slate-800">Leave Applications: </span>Any absence must be explained through a written application from the parent/guardian in the student diary, or submitted online through the Student Portal.</li>
              <li>• <span className="font-bold text-slate-800">Discipline: </span>Damage to school property, misbehavior with teachers/peers, or using mobile phones inside classroom blocks is strictly prohibited and subject to suspension.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
