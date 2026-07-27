"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, User, FileText, ArrowRight } from "lucide-react";

export default function StudentHomework() {
  const [selectedClass, setSelectedClass] = useState("V");
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const classes = ["V", "VI", "VII", "VIII", "IX", "X"];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/homework?className=${selectedClass}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setHomework(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedClass]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Workstation
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Homework & Assignments
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      {/* Class Select Bar */}
      <div className="flex gap-2 justify-center mb-10 overflow-x-auto py-1">
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              selectedClass === cls
                ? "bg-school-blue text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Homework List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-36" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <div className="text-center text-slate-400 py-16 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white">
          No homework uploaded for Class {selectedClass} yet.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {homework.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-3 relative"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                <span className="bg-school-blue/10 text-school-blue px-2 py-0.5 rounded">
                  {item.subject}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} className="text-school-gold" />
                  <span>Posted by: {item.facultyName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-school-gold" />
                  <span>Due: {new Date(item.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}</span>
                </span>
              </div>

              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
                {item.title}
              </h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify">
                {item.instruction}
              </p>

              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-school-blue hover:underline font-bold mt-2 border-t border-slate-50 pt-2.5 w-fit"
                >
                  <FileText size={14} className="text-red-500" />
                  <span>Download Homework Sheet (PDF)</span>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
