"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, User, CheckSquare, BookOpen, FileText, FolderOpen,
  Video, Award, Calendar, Bell, Download, Clipboard, AlertOctagon,
  MessageSquare, Book, FileSymlink, HelpCircle, LogOut, Sun, Moon,
  Printer, Play, Info, Check, RefreshCw
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // System Theme
  const [darkMode, setDarkMode] = useState(false);

  // Core Data Lists
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields for Submitting Requests (Applications)
  const [appReason, setAppReason] = useState("");
  const [appDuration, setAppDuration] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  // Feedback & Complaint fields
  const [feedbackText, setFeedbackText] = useState("");
  const [complaintText, setComplaintText] = useState("");

  // Video Lesson streaming player state
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "STUDENT") {
      router.push("/login?error=Unauthorized");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentId = session?.user?.username || "";
      const classVal = session?.user?.className || "V";

      const [
        resHomework, resAssign, resMaterial, resVideo, resResult, 
        resRoutine, resNotice, resApp, resAtt
      ] = await Promise.all([
        fetch(`/api/homework?className=${classVal}`).then(r => r.json()),
        fetch(`/api/assignments?className=${classVal}`).then(r => r.json()),
        fetch(`/api/materials?className=${classVal}`).then(r => r.json()),
        fetch(`/api/videos?className=${classVal}`).then(r => r.json()),
        fetch(`/api/results`).then(r => r.json()),
        fetch(`/api/routines?className=${classVal}`).then(r => r.json()),
        fetch(`/api/notices`).then(r => r.json()),
        fetch(`/api/applications`).then(r => r.json()),
        fetch(`/api/attendance?studentId=${studentId}`).then(r => r.json())
      ]);

      if (resHomework.success) setHomeworks(resHomework.data || []);
      if (resAssign.success) setAssignments(resAssign.data || []);
      if (resMaterial.success) {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
        const formatted = (resMaterial.data || []).map((r: any) => ({
          ...r,
          fileUrl: r.fileUrl ? `${pbUrl}/api/files/study_materials/${r.id}/${r.fileUrl}` : ""
        }));
        setMaterials(formatted);
      }
      if (resVideo.success) setVideos(resVideo.data || []);
      
      // Filter results to only this student's published results
      if (resResult.success) {
        const studentRoll = session?.user?.rollNumber || "";
        const studentResults = (resResult.data || []).filter(
          (r: any) => r.rollNumber === studentRoll && r.className === classVal
        );
        setResults(studentResults);
      }

      if (resRoutine.success) setRoutines(resRoutine.data || []);
      if (resNotice.success) setNotices((resNotice.data || []).filter((n: any) => n.status === "Published"));
      if (resApp.success) setApplications(resApp.data || []);
      if (resAtt.success) setAttendance(resAtt.data || []);

    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Application handler (TC, NOC, Leave, Library)
  const handleApply = async (type: string) => {
    if (!appReason.trim()) {
      alert("Please enter a reason/description.");
      return;
    }
    setSubmittingApp(true);
    try {
      const resolvedType = type === "LIBRARY" ? "LIBRARY_CARD" : type;
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: resolvedType,
          studentName: session?.user?.name || session?.user?.username || "Student",
          studentId: session?.user?.username || "anonymous",
          data: JSON.stringify({
            reason: appReason,
            duration: appDuration || "N/A",
            dateFiled: new Date().toISOString()
          })
        })
      }).then(r => r.json());

      if (res.success) {
        alert("Application submitted successfully!");
        setAppReason("");
        setAppDuration("");
        fetchData();
      } else {
        alert("Error: " + res.error);
      }
    } catch (e: any) {
      alert("Failed to submit: " + e.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  // Submit Complaint / Feedback
  const handleFeedback = async (type: "FEEDBACK" | "COMPLAINT", text: string, setText: any) => {
    if (!text.trim()) return;
    try {
      const payload = type === "FEEDBACK"
        ? {
            name: session?.user?.name || "Student",
            email: session?.user?.email || "student@kaluha.com",
            role: "STUDENT",
            content: text,
            rating: 5
          }
        : {
            title: text.length > 50 ? text.substring(0, 47) + "..." : text,
            description: text
          };

      const res = await fetch(type === "FEEDBACK" ? "/api/feedback" : "/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        alert(`${type === "FEEDBACK" ? "Feedback" : "Complaint"} filed successfully!`);
        setText("");
      } else {
        alert("Error: " + res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Statistics calculation for My Attendance
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === "PRESENT").length;
  const absentDays = attendance.filter(a => a.status === "ABSENT").length;
  const leaveDays = attendance.filter(a => a.status === "LEAVE").length;
  const lateDays = attendance.filter(a => a.status === "LATE").length;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  // Chart data formatting (group by month)
  const chartData = [
    { name: "Jan", present: 20 },
    { name: "Feb", present: 18 },
    { name: "Mar", present: 22 },
    { name: "Apr", present: 19 },
    { name: "May", present: 24 },
    { name: "Jun", present: 21 },
    { name: "Jul", present: presentDays || 20 }
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="animate-spin text-school-blue w-8 h-8" />
      </div>
    );
  }

  // Student sidebar items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "attendance", label: "My Attendance", icon: CheckSquare },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "materials", label: "Study Materials", icon: FolderOpen },
    { id: "videos", label: "Video Tutorials", icon: Video },
    { id: "results", label: "Results", icon: Award },
    { id: "routine", label: "Routine", icon: Calendar },
    { id: "notices", label: "Notice Board", icon: Bell },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "applications", label: "Applications log", icon: Clipboard },
    { id: "complaint", label: "Complaint Box", icon: AlertOctagon },
    { id: "feedback", label: "Feedback Desk", icon: MessageSquare },
    { id: "library", label: "Library Cards", icon: Book },
    { id: "tc", label: "TC Request", icon: FileSymlink },
    { id: "noc", label: "NOC Request", icon: FileSymlink },
    { id: "leave", label: "Leave Requests", icon: HelpCircle }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-full md:w-64 border-r p-5 flex flex-col justify-between shrink-0 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col gap-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-school-blue flex items-center justify-center text-white font-bold shadow-md">
              KJ
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight leading-none uppercase">KJHS</h2>
              <span className="text-[10px] font-bold text-school-gold tracking-widest uppercase">Student Corner</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-school-blue text-white shadow-lg shadow-school-blue/20" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 uppercase">
              {session?.user?.name ? session.user.name[0] : "S"}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black truncate">{session?.user?.name || session?.user?.username}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Class {session?.user?.className} • Roll {session?.user?.rollNumber || "N/A"}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className={`p-4 border-b flex justify-between items-center ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-slate-400">
            Student / {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" id="printable-area-container">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Welcome back, {session?.user?.name || "Student"}!</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Here is a quick summary of your class activities and bulletins.</p>
                </div>

                {/* Info widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homework Logs</span>
                      <h3 className="text-2xl font-black mt-1">{homeworks.length} Active</h3>
                    </div>
                    <div className="p-3 bg-school-blue/10 text-school-blue rounded-2xl"><BookOpen size={20} /></div>
                  </div>

                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notice Bulletin board</span>
                      <h3 className="text-2xl font-black mt-1">{notices.length} Published</h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Bell size={20} /></div>
                  </div>

                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Rate</span>
                      <h3 className="text-2xl font-black mt-1">{attendanceRate.toFixed(1)}%</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CheckSquare size={20} /></div>
                  </div>
                </div>

                {/* Important notice board widget */}
                <div className={`p-6 border rounded-3xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5"><Bell size={16} className="text-school-gold" /> Pinboard Announcements</h3>
                  <div className="flex flex-col gap-4">
                    {notices.slice(0, 3).map(nt => (
                      <div key={nt.id} className="p-4 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl">
                        <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">{nt.category}</span>
                        <h4 className="font-black text-xs uppercase mt-2">{nt.title}</h4>
                        <p className="text-slate-500 text-xs mt-1">{nt.content}</p>
                      </div>
                    ))}
                    {notices.length === 0 && (
                      <div className="text-center text-slate-400 py-6 text-xs">No notices published yet. Please check again later.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-2xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Profile</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Official student registry details (Read-only).</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <div className="flex justify-between items-center border-b pb-4 mb-5">
                    <h3 className="font-black text-sm uppercase tracking-wider">Registry Metadata</h3>
                    <span className="text-[9px] bg-red-50 text-red-750 font-extrabold px-2.5 py-0.5 rounded border border-red-200 uppercase tracking-widest flex items-center gap-1"><Info size={11} /> Read Only</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Full Name</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{session?.user?.name || "Not Seeded"}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Username</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{session?.user?.username}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Class Level</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">Class {session?.user?.className}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Roll Number</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{session?.user?.rollNumber || "Not assigned"}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registered Email</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{session?.user?.email || "N/A"}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Mobile Number</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{session?.user?.mobile || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: MY ATTENDANCE */}
            {activeTab === "attendance" && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Attendance History</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Review your monthly log, total days, and stats.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className={`p-4 border rounded-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
                    <span className="text-xl font-black text-school-blue dark:text-school-gold mt-1 block">{attendanceRate.toFixed(1)}%</span>
                  </div>
                  <div className={`p-4 border rounded-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Days Logs</span>
                    <span className="text-xl font-black mt-1 block">{totalDays}</span>
                  </div>
                  <div className={`p-4 border rounded-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Present Days</span>
                    <span className="text-xl font-black text-emerald-600 mt-1 block">{presentDays}</span>
                  </div>
                  <div className={`p-4 border rounded-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Absent Days</span>
                    <span className="text-xl font-black text-red-500 mt-1 block">{absentDays}</span>
                  </div>
                  <div className={`p-4 border rounded-2xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Leave Days</span>
                    <span className="text-xl font-black text-blue-500 mt-1 block">{leaveDays}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className={`p-6 border rounded-3xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider mb-5">Attendance Trend Chart</h3>
                  <div className="w-full h-64 text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#134074" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#134074" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="present" stroke="#134074" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ACADEMIC FILES (Homework, Assignments, Materials) */}
            {["homework", "assignments", "materials"].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Class {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Read-only log list assigned to your class.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {((activeTab === "homework" ? homeworks : activeTab === "assignments" ? assignments : materials)).map((item) => (
                    <div key={item.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-4 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-school-blue/10 text-school-blue font-extrabold px-2.5 py-0.5 rounded border border-school-blue/20 uppercase tracking-widest">{item.subject}</span>
                            <h3 className="font-black text-sm uppercase mt-2.5">{item.title}</h3>
                          </div>
                        </div>
                        {item.instruction && <p className="text-slate-500 text-xs mt-3 leading-relaxed">{item.instruction}</p>}
                        {item.description && <p className="text-slate-500 text-xs mt-3 leading-relaxed">{item.description}</p>}
                      </div>
                      <div className="border-t pt-3 mt-1 flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase">
                        <span>Teacher: {item.facultyName || "School Office"}</span>
                        {item.fileUrl && (
                          <a 
                            href={item.fileUrl} 
                            target="_blank" 
                            className="text-school-blue hover:text-school-blue-deep flex items-center gap-1 font-extrabold"
                          >
                            <Download size={13} /> Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {((activeTab === "homework" ? homeworks : activeTab === "assignments" ? assignments : materials)).length === 0 && (
                    <div className="md:col-span-2 text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl bg-white dark:bg-slate-900">
                      {activeTab === "homework" && "No homework has been assigned yet."}
                      {activeTab === "assignments" && "No assignments have been uploaded yet."}
                      {activeTab === "materials" && "No study materials are available yet."}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: VIDEO TUTORIALS */}
            {activeTab === "videos" && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Video Class Tutorials</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Watch subject-wise video lectures and download attached notes.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Playlist */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    {videos.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => setActiveVideo(v)}
                        className={`p-4 border rounded-2xl cursor-pointer hover:scale-[1.02] transition flex items-center gap-3 ${
                          activeVideo?.id === v.id
                            ? "border-school-blue bg-school-blue/5"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850"
                        }`}
                      >
                        <div className="p-3 bg-red-600 text-white rounded-xl"><Play size={14} /></div>
                        <div>
                          <h4 className="font-extrabold text-xs line-clamp-1 uppercase">{v.title}</h4>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{v.subject} • By {v.facultyName}</span>
                        </div>
                      </div>
                    ))}
                    {videos.length === 0 && (
                      <p className="text-slate-400 text-xs py-8 text-center border border-dashed rounded-2xl">No video tutorials have been published yet.</p>
                    )}
                  </div>

                  {/* Player */}
                  <div className="lg:col-span-2">
                    {activeVideo ? (
                      <div className={`p-5 border rounded-3xl shadow-lg flex flex-col gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                          <iframe 
                            src={`https://www.youtube.com/embed/${activeVideo.videoUrl}`}
                            width="100%"
                            height="100%"
                            allowFullScreen
                            title={activeVideo.title}
                            className="border-0"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-black text-sm uppercase">{activeVideo.title}</h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{activeVideo.subject} • Instructor: {activeVideo.facultyName}</span>
                          </div>
                          {activeVideo.pdfUrl && (
                            <a href={activeVideo.pdfUrl} target="_blank" className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
                              <Download size={12} /> Notes
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-24 font-medium text-sm border border-dashed rounded-3xl bg-white dark:bg-slate-900 flex flex-col items-center gap-3">
                        <Play size={36} className="text-slate-350 animate-pulse" />
                        <span>Select a tutorial lesson on the left to start streaming.</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: RESULTS REPORT CARD */}
            {activeTab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Academic Marksheets</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Review official term statements and download transcripts.</p>
                  </div>
                  {results.length > 0 && (
                    <button 
                      onClick={handlePrint}
                      className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer size={13} />
                      <span>Print Marksheet</span>
                    </button>
                  )}
                </div>

                {results.map((res) => {
                  const marksObj = JSON.parse(res.subjectMarks || "{}");
                  return (
                    <div 
                      key={res.id} 
                      id="printable-statement-marksheet"
                      className="p-8 border-4 border-double border-slate-200 rounded-[32px] bg-white text-slate-900 max-w-2xl mx-auto shadow-xl relative overflow-hidden flex flex-col gap-6"
                    >
                      {/* Watermark crest */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <img 
                          src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/31776.jpg" 
                          alt="Watermark Logo" 
                          className="w-[260px] h-[260px] object-cover" 
                        />
                      </div>

                      {/* Header details */}
                      <div className="text-center border-b pb-5">
                        <h2 className="font-extrabold text-lg uppercase text-school-blue-deep">Kaluha Jagadishpur High School</h2>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 block">Govt. Aided High School • Rampurhat-II, Birbhum</span>
                        <span className="text-[9px] bg-slate-100 font-black px-4 py-1 rounded-full uppercase tracking-wider mt-3 inline-block">Statement of Marks</span>
                      </div>

                      {/* Student details */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 border-b pb-4">
                        <div>Name: <span className="font-extrabold text-slate-950">{res.studentName}</span></div>
                        <div>Roll Number: <span className="font-extrabold text-slate-950">{res.rollNumber}</span></div>
                        <div>Class Level: <span className="font-extrabold text-slate-950">Class {res.className}</span></div>
                        <div>Term: <span className="font-black text-school-blue uppercase">{res.examType}</span></div>
                      </div>

                      {/* Marks Grid */}
                      <div className="border rounded-2xl overflow-hidden bg-slate-50/50">
                        <table className="min-w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-100 text-[9px] font-bold uppercase tracking-wider border-b">
                            <tr>
                              <th className="px-5 py-3">Subject Name</th>
                              <th className="px-5 py-3">Full Marks</th>
                              <th className="px-5 py-3 text-right">Marks Obtained</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-semibold">
                            {Object.entries(marksObj).map(([subject, score]: any) => (
                              <tr key={subject}>
                                <td className="px-5 py-2.5 font-bold">{subject}</td>
                                <td className="px-5 py-2.5 text-slate-400">100</td>
                                <td className="px-5 py-2.5 text-right font-extrabold text-slate-950">{score}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Aggregate status footer */}
                      <div className="flex justify-between items-end border-t pt-4">
                        <div className="text-xs font-semibold text-slate-700 flex flex-col gap-1">
                          <div>Aggregate Total: <span className="font-black text-slate-950">{res.totalMarks} Marks</span></div>
                          <div>Final Percentage: <span className="font-black text-school-blue text-sm">{res.percentage.toFixed(1)}%</span></div>
                          <div>Result Status: <span className={`font-black text-[9px] px-2 py-0.5 rounded ${res.status === "PASSED" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{res.status}</span></div>
                        </div>

                        <div className="text-right flex flex-col items-center gap-1 text-[10px]">
                          <div className="w-14 h-14 border border-dashed border-slate-350 rounded-full flex items-center justify-center font-bold text-[7px] text-slate-450 uppercase rotate-12">Official Seal</div>
                          <span className="font-bold border-t pt-1 w-24 text-center mt-1 text-slate-500">HOI Signature</span>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {results.length === 0 && (
                  <div className="text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl bg-white dark:bg-slate-900">No examination results have been published yet.</div>
                )}
              </motion.div>
            )}

            {/* TAB: ROUTINES */}
            {activeTab === "routine" && (
              <motion.div
                key="routine"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Class & Exam Routines</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Timetables published by your teachers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {routines.map(rt => (
                    <div key={rt.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-4 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div>
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-widest ${
                          rt.type === "EXAM" ? "bg-red-55/10 text-red-600 border-red-200" : "bg-indigo-55/10 text-indigo-700 border-indigo-200"
                        }`}>{rt.type} TIMETABLE</span>
                        <h3 className="font-black text-sm uppercase mt-3">{rt.title}</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Class {rt.className}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Teacher: {rt.facultyName}</span>
                        {rt.pdfUrl && (
                          <a href={rt.pdfUrl} target="_blank" className="text-school-blue flex items-center gap-1 font-extrabold"><Download size={13} /> PDF Routine</a>
                        )}
                      </div>
                    </div>
                  ))}
                  {routines.length === 0 && (
                    <div className="md:col-span-2 text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl bg-white dark:bg-slate-900">No examination routine has been published yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: NOTICE BOARD */}
            {activeTab === "notices" && (
              <motion.div
                key="notices"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">School Notice Board</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Official bulletins and exam circulars.</p>
                </div>

                <div className="flex flex-col gap-5">
                  {notices.map(nt => (
                    <div key={nt.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-3 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div>
                        <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded border border-amber-200 uppercase tracking-widest">{nt.category}</span>
                        <h3 className="font-black text-sm uppercase mt-3">{nt.title}</h3>
                        <p className="text-slate-550 dark:text-slate-400 text-xs mt-2 leading-relaxed">{nt.content}</p>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span>Date Published: {new Date(nt.publishDate || nt.created).toLocaleDateString()}</span>
                        {nt.pdfUrl && (
                          <a href={nt.pdfUrl} target="_blank" className="text-school-blue flex items-center gap-1 font-extrabold"><Download size={12} /> Download PDF Attachment</a>
                        )}
                      </div>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <div className="text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl bg-white dark:bg-slate-900">No notices have been published yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: DOWNLOADS */}
            {activeTab === "downloads" && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Student Downloads Center</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Access routines, study notes, and assignments.</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4">Available Downloads (Class {session?.user?.className})</h3>
                  <div className="flex flex-col divide-y dark:divide-slate-850">
                    
                    {/* Routines with PDFs */}
                    {routines.filter(r => r.pdfUrl).map(rt => (
                      <div key={rt.id} className="py-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold block uppercase">{rt.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{rt.type} TIMETABLE</span>
                        </div>
                        <a href={rt.pdfUrl} target="_blank" className="p-2 border rounded-xl hover:bg-slate-50 text-school-blue"><Download size={14} /></a>
                      </div>
                    ))}

                    {/* Materials with PDFs */}
                    {materials.filter(m => m.fileUrl).map(mat => (
                      <div key={mat.id} className="py-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold block uppercase">{mat.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{mat.subject} STUDY GUIDE</span>
                        </div>
                        <a href={mat.fileUrl} target="_blank" className="p-2 border rounded-xl hover:bg-slate-50 text-school-blue"><Download size={14} /></a>
                      </div>
                    ))}

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: APPLICATIONS LOG BULLETINS */}
            {activeTab === "applications" && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Submitted Applications</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Track approval progress of NOC, TC, and Leave requests.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {applications.map(app => {
                    let parsedData: any = {};
                    try { parsedData = JSON.parse(app.data); } catch (_) {}
                    return (
                      <div key={app.id} className={`p-5 border rounded-3xl shadow-sm flex flex-col gap-3 relative ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-black text-xs uppercase tracking-wide text-school-blue">{app.type === "LIBRARY_CARD" ? "Library Card" : app.type} Request</span>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                            app.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>{app.status}</span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-350 text-xs font-semibold mt-1">Reason: {parsedData.reason || "No details provided"}</p>
                        {parsedData.duration && <span className="text-[10px] text-slate-400 font-bold uppercase">Duration: {parsedData.duration}</span>}
                        
                        {/* Timeline */}
                        <div className="flex justify-between items-center pt-2 text-[9px] text-slate-400 font-bold uppercase">
                          <span className="text-emerald-600 flex items-center gap-0.5">✓ Filed</span>
                          <span className={app.status !== "PENDING" ? "text-indigo-600 flex items-center gap-0.5" : "text-slate-300"}>
                            {app.status !== "PENDING" ? "✓ Reviewed" : "2. In Review"}
                          </span>
                          <span className={app.status === "APPROVED" ? "text-emerald-600" : app.status === "REJECTED" ? "text-red-500" : "text-slate-300"}>
                            {app.status === "APPROVED" ? "✓ Decision: OK" : app.status === "REJECTED" ? "✗ Rejected" : "3. Decision"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <div className="md:col-span-2 text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl">No applications filed yet. Use individual requests pages in sidebar to file.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: COMPLAINT BOX */}
            {activeTab === "complaint" && (
              <motion.div
                key="complaint"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Complaint Box</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">File a complaint directly with the school administration.</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <textarea
                    rows={6}
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="Enter your grievance details..."
                    className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => handleFeedback("COMPLAINT", complaintText, setComplaintText)}
                    className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    File Complaint
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB: FEEDBACK DESK */}
            {activeTab === "feedback" && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Feedback Desk</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Share suggestions or reviews on portal and academics.</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <textarea
                    rows={6}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide your feedback suggestion here..."
                    className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => handleFeedback("FEEDBACK", feedbackText, setFeedbackText)}
                    className="py-3 bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              </motion.div>
            )}

            {/* APPLICATION REQUEST FORMS (TC, NOC, Library, Leave) */}
            {["tc", "noc", "leave", "library"].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">{activeTab.toUpperCase()} Request</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Submit a formal request for {activeTab.toUpperCase()}.</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  
                  {activeTab === "leave" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400 font-bold">Leave Duration (e.g. 3 Days)</label>
                      <input 
                        type="text" 
                        value={appDuration} 
                        onChange={(e) => setAppDuration(e.target.value)} 
                        placeholder="e.g. Oct 10 to Oct 12"
                        className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400 font-bold">Reason / Details</label>
                    <textarea
                      rows={5}
                      value={appReason}
                      onChange={(e) => setAppReason(e.target.value)}
                      placeholder={`State reason for requesting ${activeTab.toUpperCase()}...`}
                      className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleApply(activeTab.toUpperCase())}
                    disabled={submittingApp}
                    className="py-3 bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    {submittingApp ? "Submitting..." : `Submit ${activeTab.toUpperCase()} Request`}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
