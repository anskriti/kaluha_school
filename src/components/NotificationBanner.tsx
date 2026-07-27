// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { usePathname } from "next/navigation";

interface Notice {
  id: string;
  title: string;
  category: string;
}

export default function NotificationBanner() {
  const pathname = usePathname();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNotices(data.data.slice(0, 5));
        }
      })
      .catch(() => {
        // Fallback notices if database is empty/fetching fails
        setNotices([
          { id: "1", title: "National Means-Cum-Merit Scholarship Examination (NMMSE) 2024 (For Class VIII)", category: "ADMISSIONS" },
          { id: "2", title: "Class X Mock Board Examination Timetable published", category: "EXAMS" },
          { id: "3", title: "Kanyashree Prakalpa (K1 & K2) Renewal Notice for 2026-27", category: "GENERAL" }
        ]);
      });
  }, []);

  if (pathname?.startsWith("/dashboard")) return null;

  if (notices.length === 0) return null;

  return (
    <div className="bg-amber-50 border-y border-amber-200 text-amber-900 py-2.5 px-4 z-20 relative text-xs md:text-sm font-semibold shadow-sm overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
        {/* Banner Label */}
        <div className="flex items-center gap-1.5 bg-amber-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] md:text-xs font-bold flex-shrink-0 animate-pulse">
          <Bell size={12} />
          <span>Latest Notices</span>
        </div>

        {/* Marquee Notice Bar */}
        <div className="flex-1 overflow-hidden relative">
          {/* @ts-ignore */}
          <marquee
            className="w-full text-slate-800"
            direction="left"
            scrollamount="4"
            onMouseOver={(e: any) => (e.target as any).stop()}
            onMouseOut={(e: any) => (e.target as any).start()}
          >
            {notices.map((notice, idx) => (
              <span key={notice.id} className="mx-6 hover:text-school-blue transition duration-150">
                <Link href={`/notices#notice-${notice.id}`}>
                  <span className="text-school-blue-deep hover:underline">
                    {notice.title}
                  </span>
                  <span className="ml-1 text-[10px] bg-school-gold/20 text-school-blue font-bold px-1.5 py-0.5 rounded">
                    {notice.category}
                  </span>
                </Link>
                {idx < notices.length - 1 && <span className="mx-4 text-slate-300">|</span>}
              </span>
            ))}
          </marquee>
        </div>
      </div>
    </div>
  );
}
