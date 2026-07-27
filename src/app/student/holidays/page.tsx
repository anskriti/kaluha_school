"use client";

import { motion } from "framer-motion";
import { Calendar, AlertCircle } from "lucide-react";

export default function HolidayList() {
  const holidays = [
    { date: "January 23", day: "Friday", occasion: "Netaji's Birthday", duration: "1 Day" },
    { date: "January 26", day: "Monday", occasion: "Republic Day", duration: "1 Day" },
    { date: "February 04", day: "Wednesday", occasion: "Saraswati Puja", duration: "2 Days" },
    { date: "April 10", day: "Friday", occasion: "Good Friday", duration: "1 Day" },
    { date: "May 09", day: "Saturday", occasion: "Rabindra Jayanti", duration: "1 Day" },
    { date: "May 20 - June 10", day: "Wed - Wed", occasion: "Summer Vacation", duration: "22 Days" },
    { date: "August 15", day: "Saturday", occasion: "Independence Day", duration: "1 Day" },
    { date: "October 09 - November 02", day: "Fri - Mon", occasion: "Durga Puja & Kali Puja Vacations", duration: "25 Days" },
    { date: "December 25", day: "Friday", occasion: "Christmas Day", duration: "1 Day" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Calendar
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          School Holiday List (2026)
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5 rounded-3xl border border-white bg-white/70 shadow-lg mb-8 text-slate-600 text-xs md:text-sm font-semibold flex items-center gap-3"
      >
        <AlertCircle size={18} className="text-school-gold flex-shrink-0" />
        <p>
          Holidays are subject to modification based on official circulars from the West Bengal Board of Secondary Education (WBBSE) and Birbhum District Administration notifications.
        </p>
      </motion.div>

      {/* Holiday Table */}
      <div className="overflow-hidden border border-slate-100 rounded-3xl shadow bg-white">
        <table className="min-w-full text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Occasion / Holiday</th>
              <th className="px-6 py-4">Date(s)</th>
              <th className="px-6 py-4">Day</th>
              <th className="px-6 py-4">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {holidays.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{item.occasion}</td>
                <td className="px-6 py-4 text-school-blue-deep">{item.date}</td>
                <td className="px-6 py-4 text-slate-500">{item.day}</td>
                <td className="px-6 py-4">
                  <span className="bg-school-gold/10 text-school-blue-deep font-bold px-2 py-0.5 rounded">
                    {item.duration}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
