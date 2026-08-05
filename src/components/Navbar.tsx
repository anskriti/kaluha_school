"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, Search, Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut, Bell
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Mock Notifications
  const mockNotifications = [
    { id: 1, title: "Admission Notice 2026-27", desc: "Online applications for V-X are now open.", time: "2 hours ago" },
    { id: 2, title: "Class X Mock Board Exam", desc: "Mock exam routine has been published.", time: "1 day ago" },
    { id: 3, title: "National NMMS Scholarship", desc: "Form verification deadline extended.", time: "2 days ago" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notices?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "About",
      href: "#",
      dropdown: [
        { name: "History", href: "/about/history" },
        { name: "Vision & Mission", href: "/about/vision-mission" },
        { name: "Infrastructure", href: "/about/infrastructure" },
        { name: "Managing Committee", href: "/about/managing-committee" },
        { name: "SMC Members", href: "/about/smc" },
        { name: "Teachers", href: "/about/teachers" }
      ]
    },
    { name: "HOI Desk", href: "/hoi-desk" },
    {
      name: "Admissions",
      href: "#",
      dropdown: [
        { name: "Admission Procedure", href: "/admissions" },
        { name: "Fee Structure", href: "/admissions#fees" },
        { name: "Apply Online", href: "/admissions#apply" }
      ]
    },
    {
      name: "Academics",
      href: "#",
      dropdown: [
        { name: "Subjects Offered", href: "/academics/subjects" },
        { name: "Exam Routine", href: "/academics/exams" },
        { name: "Results", href: "/academics/results" }
      ]
    },
    {
      name: "Student Corner",
      href: "#",
      dropdown: [
        { name: "Homework & Assignments", href: "/student/homework" },
        { name: "Study Materials", href: "/student/materials" },
        { name: "Holiday List", href: "/student/holidays" },
        { name: "Rules & Regulations", href: "/student/rules" }
      ]
    },
    { name: "Notice Board", href: "/notices" },
    { name: "Gallery", href: "/gallery" },
    { name: "Achievements", href: "/achievements" },
    { name: "Alumni", href: "/alumni" },
    { name: "Contact Us", href: "/contact" }
  ];

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      {/* 1. TOP HEADER INFO BAR */}
      <div className="bg-school-blue-deep text-white py-2 text-xs border-b border-white/10 z-30 relative hidden md:block">
        <div className="w-full max-w-full px-6 md:px-12 flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <a href="tel:9434582037" className="flex items-center gap-1.5 hover:text-school-gold transition">
              <Phone size={13} className="text-school-gold" />
              <span>9434582037</span>
            </a>
            <a href="mailto:kaluhajhighschool@gmail.com" className="flex items-center gap-1.5 hover:text-school-gold transition">
              <Mail size={13} className="text-school-gold" />
              <span>kaluhajhighschool@gmail.com</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-red-655 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse bg-red-600">
              Admissions Open 2026-27
            </span>
            <Link 
              href="/admissions#apply" 
              className="bg-school-gold hover:bg-school-gold-dark text-school-blue-deep font-semibold px-3 py-1 rounded transition text-xs shadow-md"
            >
              Apply Online
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION (STICKY & GLASSMORPHIC) */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 w-full ${
          scrolled 
            ? "glass-panel shadow-lg py-2 backdrop-blur-md" 
            : "bg-white/95 border-b border-slate-100 py-3"
        }`}
      >
        <div className="w-full max-w-full px-6 md:px-12 flex justify-between items-center gap-4">
          
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-school-blue bg-white flex items-center justify-center flex-shrink-0">
              <img 
                src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/31776.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-school-blue-deep font-bold text-[10px]">KJHS</span>
            </div>
            <div>
              <h1 className="font-extrabold text-xs md:text-sm text-school-blue-deep leading-tight tracking-tight uppercase">
                Kaluha Jagadishpur
              </h1>
              <p className="text-[9px] md:text-[10px] text-school-gold font-bold tracking-widest uppercase">
                High School (Govt. Aided)
              </p>
            </div>
          </Link>

          {/* Navigation & Interactive Actions */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-between ml-8">
            
            {/* Navigation links */}
            <nav ref={navRef} className="flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((link) => {
                const isDropdownOpen = activeDropdown === link.name;
                const isChildActive = link.dropdown?.some((sub) => pathname === sub.href);
                const isActive = pathname === link.href || isChildActive;

                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                    onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
                  >
                    {link.dropdown ? (
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(isDropdownOpen ? null : link.name)}
                        className={`flex items-center gap-0.5 px-2 py-1.5 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
                          isActive || isDropdownOpen
                            ? "text-school-blue bg-school-blue-light/10"
                            : "text-slate-700 hover:text-school-blue hover:bg-slate-50"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={11} className={`opacity-75 transition-transform duration-205 ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`flex items-center px-2 py-1.5 text-xs font-bold rounded-lg transition duration-250 relative ${
                          isActive
                            ? "text-school-blue bg-school-blue-light/10"
                            : "text-slate-700 hover:text-school-blue hover:bg-slate-50"
                        }`}
                      >
                        {link.name}
                        {isActive && (
                          <motion.span 
                            layoutId="activeNavIndicator"
                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-school-blue rounded-full"
                          />
                        )}
                      </Link>
                    )}

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {link.dropdown && isDropdownOpen && (
                        <div className="absolute top-full left-0 pt-1 z-55 min-w-[13rem]">
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="bg-white border border-slate-100 rounded-xl shadow-xl py-1"
                          >
                            {link.dropdown.map((subLink) => (
                              <Link
                                key={subLink.name}
                                href={subLink.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`block px-4 py-2 text-xs font-semibold transition ${
                                  pathname === subLink.href
                                    ? "bg-school-blue-light/10 text-school-blue font-black"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-school-blue"
                                }`}
                              >
                                {subLink.name}
                              </Link>
                            ))}
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right side Actions */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {/* Admission Prominent Link */}
              <Link 
                href="/admissions"
                className="bg-school-gold/10 hover:bg-school-gold border border-school-gold/40 text-school-blue-deep font-bold px-3 py-1.5 rounded-full text-xs transition shrink-0"
              >
                Admissions
              </Link>

              {/* Notification Bell */}
              <div className="relative shrink-0" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-slate-500 hover:text-school-blue rounded-full hover:bg-slate-50 transition cursor-pointer relative"
                >
                  <Bell size={16} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded-2xl shadow-xl z-55 p-3 flex flex-col gap-2 text-slate-800">
                      <h4 className="font-extrabold text-[10px] uppercase text-slate-400 border-b pb-1">Notice Bulletin</h4>
                      <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                        {mockNotifications.map(n => (
                          <div key={n.id} className="text-xs text-left">
                            <span className="font-bold block text-slate-800">{n.title}</span>
                            <p className="text-slate-450 text-[10px] mt-0.5 leading-tight">{n.desc}</p>
                            <span className="text-[9px] text-slate-350 mt-1 block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login / Dashboard Action */}
              {session ? (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/${(session?.user?.role || session?.user?.user_role || "faculty").toLowerCase() === "teacher" ? "faculty" : (session?.user?.role || session?.user?.user_role || "faculty").toLowerCase()}`}
                    className="flex items-center gap-1 bg-school-blue text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-school-blue-deep transition shadow-md shadow-school-blue/15"
                  >
                    <LayoutDashboard size={13} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-slate-500 hover:text-red-550 p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 bg-school-blue text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-school-blue-deep transition shadow-md shadow-school-blue/15 shrink-0"
                >
                  <LogIn size={13} />
                  <span>Portal Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-700 p-2 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 shadow-2xl overflow-y-auto p-5 lg:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/31776.jpg"
                      alt="Logo"
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <span className="font-extrabold text-sm text-school-blue-deep uppercase">KJHS Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full mb-6">
                  <input
                    type="text"
                    placeholder="Search site..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg text-xs border border-slate-200 bg-slate-50"
                  />
                  <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 cursor-pointer">
                    <Search size={14} />
                  </button>
                </form>

                <nav className="flex flex-col gap-1.5 font-bold text-xs uppercase tracking-wide">
                  {navLinks.map((link) => (
                    <div key={link.name} className="border-b border-slate-50 pb-1">
                      {link.dropdown ? (
                        <div>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                            className="w-full flex justify-between items-center py-2 px-2 text-slate-700 hover:text-school-blue rounded-lg cursor-pointer"
                          >
                            <span>{link.name}</span>
                            <ChevronDown size={13} className={`transform transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === link.name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-4 flex flex-col gap-1 bg-slate-50 rounded-lg py-1 mt-1 font-semibold text-[11px]"
                              >
                                {link.dropdown.map((subLink) => (
                                  <Link
                                    key={subLink.name}
                                    href={subLink.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 px-3 text-slate-600 hover:text-school-blue"
                                  >
                                    {subLink.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-2 px-2 rounded-lg ${
                            pathname === link.href ? "text-school-blue bg-school-blue/5" : "text-slate-700 hover:text-school-blue"
                          }`}
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-3 mt-6">
                <a href="tel:9434582037" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Phone size={14} className="text-school-gold" />
                  <span>9434582037</span>
                </a>
                <a href="mailto:kaluhajhighschool@gmail.com" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Mail size={14} className="text-school-gold" />
                  <span>kaluhajhighschool@gmail.com</span>
                </a>
                {session ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-lg text-center transition flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Log Out from Portal</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full mt-2 bg-school-blue hover:bg-school-blue-deep text-white text-xs font-bold py-2.5 rounded-lg text-center transition flex justify-center items-center gap-1"
                  >
                    <LogIn size={12} />
                    <span>Portal Login</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
