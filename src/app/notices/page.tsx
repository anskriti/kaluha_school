"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Pin, FileText, ChevronRight, X, Download } from "lucide-react";

function NoticeBoardContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [notices, setNotices] = useState<any[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("ALL");
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "ALL", 
    "General Notice", 
    "Examination Notice", 
    "Class Routine", 
    "Holiday Notice", 
    "Admission Notice", 
    "Result Notice", 
    "Circular"
  ];

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category !== "ALL") query.append("category", category);
    if (search) query.append("search", search);

    fetch(`/api/notices?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNotices(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Bulletins
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Official Notice Board
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                category === cat
                  ? "bg-school-blue text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue text-xs font-semibold"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-6 h-32" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center text-slate-400 py-16 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white">
          No notices have been published yet. Please check again later.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => setSelectedNotice(notice)}
              className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-school-blue/20 hover:shadow-lg transition cursor-pointer relative flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  {new Date(notice.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
                <span className="text-[9px] bg-school-gold/10 text-school-blue-deep font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {notice.category}
                </span>
                {notice.pinned && (
                  <span className="flex items-center gap-0.5 text-amber-600 text-[10px] font-extrabold uppercase tracking-wide">
                    <Pin size={10} fill="currentColor" />
                    <span>Pinned</span>
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-slate-800 text-sm md:text-base pr-8">
                {notice.title}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-2">
                {notice.category === "Examination Notice" 
                  ? "[Examination Timetable]" 
                  : notice.category === "Class Routine" 
                    ? "[Class Timetable]" 
                    : notice.content}
              </p>

              <div className="flex justify-between items-center mt-2 text-[10px] text-school-blue font-bold uppercase tracking-wider border-t border-slate-50 pt-2.5">
                <span>View Bulletin</span>
                <ChevronRight size={13} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Live Notice Detail Popup Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-3xl z-50 p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] bg-school-gold/10 text-school-blue font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedNotice.category}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 font-mono">
                    Published: {new Date(selectedNotice.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug mb-3">
                  {selectedNotice.title}
                </h3>
                
                {/* Render General / Text notices */}
                {!["Examination Notice", "Class Routine"].includes(selectedNotice.category) && (
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium text-justify">
                    {selectedNotice.content}
                  </p>
                )}

                {/* Render Examination Notice Table */}
                {selectedNotice.category === "Examination Notice" && (() => {
                  let rows = [];
                  try {
                    rows = JSON.parse(selectedNotice.content);
                  } catch (_) {}
                  if (!Array.isArray(rows) || rows.length === 0) {
                    return <p className="text-slate-400 italic text-center py-4 text-xs font-semibold">No exam schedule records found or invalid data format.</p>;
                  }
                  return (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl mt-2">
                      <table className="min-w-full text-left border-collapse text-[11px] md:text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase text-[9px] text-slate-400">
                            <th className="p-3">Subject</th>
                            <th className="p-3">Exam Date</th>
                            <th className="p-3">Day</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Full Marks</th>
                            <th className="p-3">Room</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r: any, idx: number) => (
                            <tr key={idx} className="border-b last:border-0 border-slate-100 font-medium">
                              <td className="p-3 font-bold text-slate-800">{r.subject || "-"}</td>
                              <td className="p-3 text-slate-600">{r.examDate || "-"}</td>
                              <td className="p-3 text-slate-600">{r.day || "-"}</td>
                              <td className="p-3 text-slate-600">{r.time || "-"}</td>
                              <td className="p-3 font-semibold text-school-blue">{r.fullMarks || "-"}</td>
                              <td className="p-3 text-slate-500">{r.room || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Render Class Routine Timetable */}
                {selectedNotice.category === "Class Routine" && (() => {
                  let timetable: any = null;
                  try {
                    timetable = JSON.parse(selectedNotice.content);
                  } catch (_) {}
                  if (!timetable) {
                    return <p className="text-slate-400 italic text-center py-4 text-xs font-semibold">No routine timetable records found or data format is invalid.</p>;
                  }
                  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  return (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl mt-2">
                      <table className="min-w-full text-center border-collapse text-[11px] md:text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-bold uppercase text-[9px] text-slate-400">
                            <th className="p-3 text-left">Day</th>
                            {Array(8).fill(null).map((_, i) => (
                              <th key={i} className="p-3 font-black">P{i + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {days.map(day => {
                            const periods = timetable[day] || [];
                            return (
                              <tr key={day} className="border-b last:border-0 border-slate-100 font-medium">
                                <td className="p-3 text-left font-black uppercase text-[9px] text-slate-400 bg-slate-50/50">{day.substring(0, 3)}</td>
                                {Array(8).fill(null).map((_, pIdx) => {
                                  const p = periods[pIdx] || { subject: "", teacher: "" };
                                  return (
                                    <td key={pIdx} className="p-2 border-l border-slate-100 min-w-24">
                                      <div className="font-bold text-slate-800">{p.subject || "-"}</div>
                                      {p.teacher && <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{p.teacher}</div>}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Attachments & Downloads */}
              <div className="flex flex-col gap-3 mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Attachments
                </h4>
                {selectedNotice.pdfUrl ? (
                  <a
                    href={selectedNotice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-bold text-school-blue-deep"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      <span>Download Official Circular (PDF)</span>
                    </div>
                    <Download size={14} />
                  </a>
                ) : (
                  <div
                    onClick={() => alert("This circular does not contain separate files. Please print or read the content above.")}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-bold text-slate-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span>No downloadable attachment</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NoticeBoard() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-bold text-slate-400">Loading notices...</div>}>
      <NoticeBoardContent />
    </Suspense>
  );
}
