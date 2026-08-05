"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, User, Calendar, BookOpen } from "lucide-react";

export default function StudyMaterials() {
  const [selectedClass, setSelectedClass] = useState("V");
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const classes = ["V", "VI", "VII", "VIII", "IX", "X"];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/materials?className=${selectedClass}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
          const formatted = data.data.map((r: any) => ({
            ...r,
            fileUrl: r.fileUrl ? `${pbUrl}/api/files/study_materials/${r.id}/${r.fileUrl}` : ""
          }));
          setMaterials(formatted);
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
          Downloads
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Study Materials & Notes
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

      {/* Materials List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-24" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center text-slate-400 py-16 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white">
          No study materials uploaded for Class {selectedClass} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between hover:border-school-blue/20 transition"
            >
              <div>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono mb-2">
                  <span className="bg-school-blue/10 text-school-blue px-2 py-0.5 rounded">
                    {item.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={11} className="text-school-gold" />
                    <span>{item.facultyName}</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-school-blue-deep transition"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-red-500" />
                    <span>Download Notes (PDF)</span>
                  </div>
                  <Download size={13} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
