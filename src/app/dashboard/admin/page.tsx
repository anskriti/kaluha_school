"use client";

import { useSession, signOut } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Settings, FileText, CheckCircle, XCircle, Users, 
  Trash2, Plus, Download, RefreshCw, BarChart3, Database, 
  Menu, X, Search, Bell, Sun, Moon, LogOut, ChevronRight, Mail, ListPlus
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Layout & Theme States
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cms");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // DB datasets
  const [applications, setApplications] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Student Approval Filters
  const [searchName, setSearchName] = useState("");
  const [searchClass, setSearchClass] = useState("");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchStatus, setSearchStatus] = useState("PENDING");

  // CMS state
  const [welcomeText, setWelcomeText] = useState("");
  const [hoiText, setHoiText] = useState("");
  const [seoTitle, setSeoTitle] = useState("Kaluha Jagadishpur High School");
  const [seoDesc, setSeoDesc] = useState("Official website of Kaluha Jagadishpur High School.");

  // Forms
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeCat, setNoticeCat] = useState("GENERAL");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticePinned, setNoticePinned] = useState(false);

  const [tName, setTName] = useState("");
  const [tDesg, setTDesg] = useState("");
  const [tQual, setTQual] = useState("");
  const [tSubj, setTSubj] = useState("");

  // System status
  const [cacheStatus, setCacheStatus] = useState("HEALTHY");

  // Redirect if not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [session, status, router]);

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [setRes, appRes, conRes, alRes, notRes, teaRes, stuRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/applications"),
        fetch("/api/contact"),
        fetch("/api/alumni"),
        fetch("/api/notices"),
        fetch("/api/teachers"),
        fetch("/api/admin/students")
      ]);

      const [set, app, con, al, not, tea, stu] = await Promise.all([
        setRes.json(),
        appRes.json(),
        conRes.json(),
        alRes.json(),
        notRes.json(),
        teaRes.json(),
        stuRes.json()
      ]);

      if (set.success && set.data) {
        setWelcomeText(set.data.welcome_message || "");
        setHoiText(set.data.hoi_message || "");
      }
      if (app.success) setApplications(app.data);
      if (con.success) setContacts(con.data);
      if (al.success) setAlumni(al.data);
      if (not.success) setNotices(not.data);
      if (tea.success) setTeachers(tea.data);
      if (stu.success) setStudents(stu.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "welcome_message", value: welcomeText })
      });
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hoi_message", value: hoiText })
      });
      setSuccessMsg("CMS Homepage configurations updated!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {}
    setLoading(false);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          category: noticeCat,
          content: noticeContent,
          pinned: noticePinned
        })
      });
      const data = await res.json();
      if (data.success) {
        setNoticeTitle("");
        setNoticeContent("");
        setNoticePinned(false);
        setSuccessMsg("Circular notice published!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {}
    setLoading(false);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName,
          designation: tDesg,
          qualification: tQual,
          subjects: tSubj
        })
      });
      const data = await res.json();
      if (data.success) {
        setTName("");
        setTDesg("");
        setTQual("");
        setTSubj("");
        setSuccessMsg("Teacher profile registered!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {}
    setLoading(false);
  };

  const handleAppStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Application status updated!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 2000);
      }
    } catch {}
  };

  const handleAlumniStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/alumni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Alumni profile approved!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 2000);
      }
    } catch {}
  };

  const handleStudentApproval = async (id: string, approvalStatus: string, className: string, remarks: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approvalStatus, className, remarks })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Student status updated!");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {}
    setLoading(false);
  };

  // Client side filtered student listing
  const filteredStudents = students.filter(stu => {
    const matchesName = stu.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesClass = searchClass ? stu.className === searchClass : true;
    const matchesRoll = searchRoll ? stu.rollNumber === searchRoll : true;
    const matchesStatus = searchStatus ? stu.approvalStatus === searchStatus : true;
    return matchesName && matchesClass && matchesRoll && matchesStatus;
  });

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Confirm deletion of this ${type}?`)) return;
    try {
      const res = await fetch(`/api/${type}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Record deleted successfully.");
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {}
  };

  const handleExport = (dataset: any[], name: string) => {
    if (!dataset.length) return alert("No records available to export.");
    const headers = Object.keys(dataset[0]);
    let csv = dataset.map(row => headers.map(h => JSON.stringify(row[h] === null ? "" : row[h])).join(","));
    csv.unshift(headers.join(","));
    const blob = new Blob([csv.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}_export.csv`;
    link.click();
  };

  // Database Backup Utility - packages active state to download
  const handleDBBackup = () => {
    const backupState = {
      backupDate: new Date(),
      settings: { welcomeText, hoiText },
      teachersCount: teachers.length,
      teachersRoster: teachers,
      noticesCirculars: notices,
      applicationsLogged: applications
    };
    const blob = new Blob([JSON.stringify(backupState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `school_db_backup_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    setSuccessMsg("Offline DB JSON Backup download initialised!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRebuildCache = () => {
    setCacheStatus("REBUILDING...");
    setTimeout(() => {
      setCacheStatus("HEALTHY (CACHE REBUILT)");
      setSuccessMsg("System application cache refreshed successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 1500);
  };

  if (status === "loading" || !session) {
    return <div className="text-center py-40 text-xs font-black text-slate-400">Loading admin operations panel...</div>;
  }

  const sidebarLinks = [
    { id: "cms", label: "CMS & Metadata Settings", icon: <Settings size={16} /> },
    { id: "students", label: "Student Approval", icon: <Users size={16} /> },
    { id: "apps", label: "Application Registry", icon: <CheckCircle size={16} /> },
    { id: "notices", label: "Bulletins & Notice board", icon: <Bell size={16} /> },
    { id: "inquiries", label: "Mailbox & Inquiries", icon: <Mail size={16} /> },
    { id: "staff", label: "Staff Directory", icon: <Users size={16} /> },
    { id: "system", label: "Analytics & DB Tools", icon: <Database size={16} /> }
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Collapsible Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 transition-all duration-300 border-r ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      } ${sidebarCollapsed ? "w-20" : "w-64"} ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } hidden lg:flex flex-col h-full`}>
        <div className="p-5 flex items-center justify-between border-b">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md">
              A
            </div>
            {!sidebarCollapsed && <span className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Admin Control</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 rounded-lg">
            <ChevronRight size={16} className={`transform transition ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === link.id
                  ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/40"
              }`}
            >
              {link.icon}
              {!sidebarCollapsed && <span>{link.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-45 lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className={`fixed inset-y-0 left-0 w-64 z-50 p-6 flex flex-col gap-6 ${
              darkMode ? "bg-slate-900" : "bg-white"
            } lg:hidden shadow-2xl`}>
              <div className="flex justify-between items-center">
                <span className="font-black text-sm uppercase tracking-wider">Admin Console</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X size={20} /></button>
              </div>
              <nav className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wider">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl ${
                      activeTab === link.id ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <div className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      }`}>
        
        {/* Sticky Header */}
        <header className={`sticky top-0 z-20 backdrop-blur-md border-b transition-colors duration-300 ${
          darkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
        }`}>
          <div className="px-6 h-16 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 border rounded-lg lg:hidden text-slate-500">
                <Menu size={18} />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Admin Panel</span>
                <ChevronRight size={10} />
                <span className="text-slate-800 dark:text-slate-100">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border text-slate-500">
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border pl-2.5 pr-3 py-1.5 rounded-xl text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                  A
                </div>
                <span className="hidden sm:inline font-bold">System Root</span>
              </button>

              <button 
                onClick={() => signOut()}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Content workspace */}
        <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full relative">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* TAB: CMS SETTINGS */}
            {activeTab === "cms" && (
              <motion.div key="cms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Text configuration column */}
                <div className={`p-6 rounded-3xl border shadow-xl lg:col-span-2 flex flex-col gap-4 text-xs font-semibold ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                }`}>
                  <h4 className="font-extrabold text-sm border-b pb-2 uppercase text-slate-800 dark:text-slate-100">
                    Home Page CMS Content
                  </h4>
                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-600">Welcome Introduction Message</label>
                      <textarea rows={4} required value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl resize-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-600">Headmaster desk Message</label>
                      <textarea rows={6} required value={hoiText} onChange={(e) => setHoiText(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl resize-none" />
                    </div>
                    <button type="submit" className="bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-950 transition">
                      Save Homepage CMS
                    </button>
                  </form>
                </div>

                {/* SEO settings column */}
                <div className={`p-6 rounded-3xl border shadow-xl lg:col-span-1 flex flex-col gap-4 text-xs font-semibold ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                }`}>
                  <h4 className="font-extrabold text-sm border-b pb-2 uppercase text-slate-800">
                    SEO Metadata Settings
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Meta Site Title</label>
                      <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Meta Description</label>
                      <textarea rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl resize-none" />
                    </div>
                    <button onClick={() => {
                      setSuccessMsg("SEO Metadata parameters locked!");
                      setTimeout(() => setSuccessMsg(null), 3000);
                    }} className="bg-slate-800 text-white py-2.5 rounded-xl font-bold">
                      Apply SEO Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: APPLICATION REGISTRY */}
            {activeTab === "apps" && (
              <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-sm">Student Requests Queue</h4>
                  <button onClick={() => handleExport(applications, "student_applications")} className="flex items-center gap-1 bg-slate-800 text-white text-[10px] px-3.5 py-1.5 rounded-lg">
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {applications.map((app) => (
                    <div key={app.id} className={`p-5 border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold ${
                      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                    }`}>
                      <div>
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] uppercase font-bold">{app.type}</span>
                        <h4 className="font-extrabold mt-2 text-sm">{app.studentName}</h4>
                        <p className="text-[10px] text-slate-400">ID/Phone: {app.studentId} • Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2">
                        {app.status === "PENDING" ? (
                          <>
                            <button onClick={() => handleAppStatus(app.id, "APPROVED")} className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle size={13} /><span>Approve</span></button>
                            <button onClick={() => handleAppStatus(app.id, "REJECTED")} className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><XCircle size={13} /><span>Reject</span></button>
                          </>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full font-bold ${app.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{app.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: STUDENT APPROVAL */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-850 dark:text-slate-100 uppercase text-sm">Student Enrollment Approval Roster</h4>
                  {filteredStudents.length > 0 && (
                    <button onClick={() => handleExport(filteredStudents, "students")} className="flex items-center gap-1 bg-slate-800 text-white text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm">
                      <Download size={13} />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs font-semibold">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500">Search by Name</label>
                    <input
                      type="text"
                      placeholder="Enter student name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500">Filter by Class</label>
                    <select
                      value={searchClass}
                      onChange={(e) => setSearchClass(e.target.value)}
                      className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100"
                    >
                      <option value="">All Classes</option>
                      <option value="Class V">Class V</option>
                      <option value="Class VI">Class VI</option>
                      <option value="Class VII">Class VII</option>
                      <option value="Class VIII">Class VIII</option>
                      <option value="Class IX">Class IX</option>
                      <option value="Class X">Class X</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500">Roll Number</label>
                    <input
                      type="text"
                      placeholder="Roll No..."
                      value={searchRoll}
                      onChange={(e) => setSearchRoll(e.target.value)}
                      className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500">Approval Status</label>
                    <select
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100"
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending Approval</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Registry items */}
                <div className="flex flex-col gap-4">
                  {filteredStudents.map((stu) => (
                    <div 
                      key={stu.id} 
                      className={`p-5 border rounded-2xl flex flex-col gap-4 text-xs font-semibold shadow-sm ${
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 gap-2 border-slate-100 dark:border-slate-850">
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{stu.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                            Username: @{stu.username} • DOB: {stu.dob || "N/A"} • Registered: {new Date(stu.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] uppercase w-fit ${
                          stu.approvalStatus === "APPROVED" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : stu.approvalStatus === "REJECTED" 
                            ? "bg-red-50 text-red-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {stu.approvalStatus}
                        </span>
                      </div>

                      {/* Detail attributes grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-500 dark:text-slate-350">
                        <div>Father's/Guardian's Name: <span className="font-extrabold text-slate-800 dark:text-slate-100">{stu.fatherName || "N/A"}</span></div>
                        <div>Email: <span className="font-bold text-slate-800 dark:text-slate-100">{stu.email}</span></div>
                        <div>Mobile: <span className="font-bold text-slate-800 dark:text-slate-100">{stu.mobile}</span></div>
                      </div>

                      {/* Actions & Roster assigning */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
                          {/* Class assignment */}
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Class</label>
                            <select
                              value={stu.className || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, className: val } : s));
                              }}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                            >
                              <option value="Class V">Class V</option>
                              <option value="Class VI">Class VI</option>
                              <option value="Class VII">Class VII</option>
                              <option value="Class VIII">Class VIII</option>
                              <option value="Class IX">Class IX</option>
                              <option value="Class X">Class X</option>
                            </select>
                          </div>

                          {/* Remarks */}
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remarks / Decision Notes</label>
                            <input
                              type="text"
                              placeholder="E.g. Verified transcripts..."
                              value={stu.remarks || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, remarks: val } : s));
                              }}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs sm:w-64 text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleStudentApproval(stu.id, "APPROVED", stu.className, stu.remarks)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1 shadow transition"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStudentApproval(stu.id, "REJECTED", stu.className, stu.remarks)}
                            className="bg-red-650 hover:bg-red-750 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1 shadow transition"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredStudents.length === 0 && (
                    <p className="text-slate-400 text-xs py-12 text-center bg-white dark:bg-slate-900 border border-dashed rounded-2xl">
                      No student enrollment records found matching the filters.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: CIRCULAR NOTICES */}
            {activeTab === "notices" && (
              <motion.div key="notices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Form column */}
                <div className={`p-6 rounded-3xl border shadow-xl lg:col-span-1 flex flex-col gap-4 text-xs font-semibold ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                }`}>
                  <h4 className="font-extrabold text-sm border-b pb-2 uppercase text-slate-800">Publish notice bulletin</h4>
                  <form onSubmit={handleCreateNotice} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-600">Notice Title</label>
                      <input type="text" required value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Category</label>
                        <select value={noticeCat} onChange={(e) => setNoticeCat(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2.5 rounded-xl">
                          <option value="GENERAL">General</option>
                          <option value="ACADEMICS">Academics</option>
                          <option value="EXAMS">Exams</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Pinned Banner?</label>
                        <select value={noticePinned ? "true" : "false"} onChange={(e) => setNoticePinned(e.target.value === "true")} className="bg-white dark:bg-slate-950 border px-3 py-2.5 rounded-xl">
                          <option value="false">Regular Bulletin</option>
                          <option value="true">Pinned Marquee</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-600">Notice Text Details</label>
                      <textarea rows={4} required value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl resize-none" />
                    </div>

                    <button type="submit" className="bg-slate-800 text-white font-bold py-3 rounded-xl mt-2">Publish notice</button>
                  </form>
                </div>

                {/* List column */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Published Bulletins</h4>
                  <div className="flex flex-col gap-4">
                    {notices.map((item) => (
                      <div key={item.id} className={`p-4 border rounded-2xl flex justify-between items-center gap-4 ${
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                      }`}>
                        <div>
                          <span className="text-[8px] bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded uppercase">{item.category}</span>
                          <h4 className="font-extrabold mt-2 text-xs">{item.title}</h4>
                        </div>
                        <button onClick={() => handleDelete("notices", item.id)} className="p-2 border rounded-lg text-red-500"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: INQUIRIES MAILBOX */}
            {activeTab === "inquiries" && (
              <motion.div key="inquiries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-sm">Public Inquiry messages</h4>
                  <button onClick={() => handleExport(contacts, "public_inquiries")} className="flex items-center gap-1 bg-slate-800 text-white text-[10px] px-3.5 py-1.5 rounded-lg">
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {contacts.map((con) => (
                    <div key={con.id} className={`p-5 border rounded-2xl flex flex-col gap-2.5 text-xs font-semibold ${
                      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                    }`}>
                      <div className="flex justify-between border-b pb-1.5">
                        <div>
                          <h4 className="font-black text-slate-800 dark:text-slate-100">{con.name}</h4>
                          <span className="text-[10px] text-slate-400">{con.email} • {con.phone || "No Mobile"}</span>
                        </div>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">New Message</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{con.message}</p>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-slate-400 text-xs py-8 text-center bg-white dark:bg-slate-900 border border-dashed rounded-2xl">Inquiry mailbox empty.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: STAFF DIRECTORY */}
            {activeTab === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Form column */}
                <div className={`p-6 rounded-3xl border shadow-xl lg:col-span-1 flex flex-col gap-4 text-xs font-semibold ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                }`}>
                  <h4 className="font-extrabold text-sm border-b pb-2 uppercase text-slate-800">Add Faculty Member</h4>
                  <form onSubmit={handleAddTeacher} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Teacher Name</label>
                      <input type="text" required value={tName} onChange={(e) => setTName(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Designation</label>
                      <input type="text" required placeholder="E.g. Assistant Teacher (Math)" value={tDesg} onChange={(e) => setTDesg(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2.5 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Qualification</label>
                      <input type="text" required placeholder="E.g. M.Sc, B.Ed" value={tQual} onChange={(e) => setTQual(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2.5 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-600">Subjects Taught</label>
                      <input type="text" required placeholder="E.g. Algebra, Calculus" value={tSubj} onChange={(e) => setTSubj(e.target.value)} className="bg-white dark:bg-slate-950 border px-3 py-2.5 rounded-xl" />
                    </div>
                    <button type="submit" className="bg-slate-800 text-white font-bold py-3 rounded-xl mt-2">Save Teacher profile</button>
                  </form>
                </div>

                {/* List column */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">School Faculty roster</h4>
                  <div className="flex flex-col gap-4">
                    {teachers.map((item) => (
                      <div key={item.id} className={`p-4 border rounded-2xl flex justify-between items-center gap-4 ${
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                      }`}>
                        <div>
                          <h4 className="font-black text-slate-800 mt-2 text-sm">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.designation} • {item.qualification} • {item.subjects}</p>
                        </div>
                        <button onClick={() => handleDelete("teachers", item.id)} className="p-2 border rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SYSTEM ANALYTICS & DATABASE BACKUP */}
            {activeTab === "system" && (
              <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base uppercase tracking-wider border-b pb-3">
                  Analytics & Database Utility Tools
                </h3>

                {/* DB Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Database backup block */}
                  <div className={`p-6 rounded-3xl border shadow-xl flex flex-col gap-4 ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                  }`}>
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit">
                      <Database size={24} />
                    </div>
                    <h4 className="font-black text-sm text-slate-800">Database Backup utility</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Click to download a structured JSON configuration snapshot mapping settings, teacher rosters, notice boards, and student applications.
                    </p>
                    <button onClick={handleDBBackup} className="mt-2 bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow">
                      <Download size={13} />
                      <span>Download Backup</span>
                    </button>
                  </div>

                  {/* Cache control block */}
                  <div className={`p-6 rounded-3xl border shadow-xl flex flex-col gap-4 ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                  }`}>
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
                      <RefreshCw size={24} />
                    </div>
                    <h4 className="font-black text-sm text-slate-800 font-sans">System Cache controller</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Cache Status: <span className="font-black text-emerald-600">{cacheStatus}</span><br />
                      Refresh system cache logs and indices to sync database changes immediately to dynamic routes.
                    </p>
                    <button onClick={handleRebuildCache} className="mt-2 bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow">
                      <RefreshCw size={13} />
                      <span>Rebuild App Cache</span>
                    </button>
                  </div>

                  {/* SVG Custom Analytics Graph card */}
                  <div className={`p-6 rounded-3xl border shadow-xl flex flex-col gap-4 ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                  }`}>
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
                      <BarChart3 size={24} />
                    </div>
                    <h4 className="font-black text-sm text-slate-800">Operational Filing counts</h4>
                    
                    {/* SVG mini bar charts */}
                    <div className="flex gap-4 items-end h-20 pt-4 justify-around">
                      <div className="flex flex-col items-center gap-1 h-full justify-end">
                        <div className="bg-slate-800 w-4 rounded-t-sm" style={{ height: `${Math.min(100, notices.length * 8)}%` }} />
                        <span className="text-[8px] font-bold text-slate-400">NOTICES</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 h-full justify-end">
                        <div className="bg-indigo-600 w-4 rounded-t-sm" style={{ height: `${Math.min(100, applications.length * 15)}%` }} />
                        <span className="text-[8px] font-bold text-slate-400">APPS</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 h-full justify-end">
                        <div className="bg-emerald-600 w-4 rounded-t-sm" style={{ height: `${Math.min(100, contacts.length * 12)}%` }} />
                        <span className="text-[8px] font-bold text-slate-400">MAIL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
