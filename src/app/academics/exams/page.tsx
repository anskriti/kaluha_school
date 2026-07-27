"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, AlertCircle, Download } from "lucide-react";

export default function ExamRoutine() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/routines?type=EXAM")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRoutines(data.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Timetables
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Examination Routine
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl p-6 h-36" />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <div className="text-center text-slate-400 py-16 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center gap-3">
          <AlertCircle size={32} className="text-slate-350" />
          <span>No examination routine has been published yet. Please wait for updates from the school.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {routines.map((rt) => {
            let scheduleGrid: any = null;
            try {
              if (rt.schedule) scheduleGrid = JSON.parse(rt.schedule);
            } catch (_) {}

            return (
              <motion.div
                key={rt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md flex flex-col gap-5"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <span className="text-[10px] bg-red-50 text-red-750 font-bold px-2 py-0.5 rounded border border-red-200 uppercase tracking-widest">
                      Class {rt.className} Exam
                    </span>
                    <h3 className="font-black text-slate-800 text-base uppercase mt-2">{rt.title}</h3>
                  </div>
                  {rt.pdfUrl && (
                    <a
                      href={rt.pdfUrl}
                      target="_blank"
                      className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm transition"
                    >
                      <Download size={13} />
                      <span>Download PDF Timetable</span>
                    </a>
                  )}
                </div>

                {scheduleGrid ? (
                  <div className="overflow-hidden border border-slate-100 rounded-2xl">
                    <table className="min-w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b">
                        <tr>
                          <th className="px-5 py-3">Day</th>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <th key={i} className="px-5 py-3">Period {i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y font-semibold">
                        {Object.entries(scheduleGrid).map(([day, periods]: any) => (
                          <tr key={day} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 font-bold text-school-blue-deep">{day}</td>
                            {periods.map((p: string, idx: number) => (
                              <td key={idx} className="px-5 py-3.5 text-slate-600">{p || "-"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">Please view the attached PDF for full examination routine details.</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
