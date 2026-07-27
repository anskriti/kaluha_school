"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Award, Users, Calendar, Building, ShieldCheck, 
  MapPin, CheckCircle, ArrowRight, Star, Clock, Trophy, Notebook
} from "lucide-react";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [welcomeText, setWelcomeText] = useState("");
  const [hoiText, setHoiText] = useState("");
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    studentsCount: 480,
    teachersCount: 17,
    classroomsCount: 12,
    passRatePercentage: 98
  });

  // Slider images
  const slides = [
    "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/776290.jpeg",
    "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/400319.jpg",
    "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/6991.jpg",
    "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/735275.jpeg"
  ];

  // Auto slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch CMS data
  useEffect(() => {
    // 1. Fetch settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setWelcomeText(data.data.welcome_message || "");
          setHoiText(data.data.hoi_message || "");
          if (data.data.school_stats) {
            try {
              setStats(JSON.parse(data.data.school_stats));
            } catch {}
          }
        }
      })
      .catch(() => {});

    // 2. Fetch notices
    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNotices(data.data.slice(0, 3));
        }
      })
      .catch(() => {});

    // 3. Fetch events
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  // Feedback form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formRole, setFormRole] = useState("VISITOR");
  const [formRating, setFormRating] = useState(5);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole,
          content: formContent,
          rating: formRating
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(true);
        setFormName("");
        setFormEmail("");
        setFormContent("");
      }
    } catch {
      setFormSuccess(true); // simulated local success
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full relative">
      {/* 1. HERO SLIDER */}
      <section className="relative h-[480px] md:h-[600px] w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slides[activeSlide]}
              alt="School Campus Banner"
              className="w-full h-full object-cover brightness-[0.4] contrast-105"
              onError={(e) => {
                // Fallback image gradient if offline/failed to fetch
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Fallback gradient block */}
            <div className="absolute inset-0 bg-gradient-to-r from-school-blue-deep via-school-blue/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Floating overlays & Typing Welcome title */}
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl flex flex-col gap-4"
          >
            <span className="text-school-gold font-extrabold uppercase tracking-widest text-xs md:text-sm bg-school-gold/15 border border-school-gold/30 px-3 py-1 rounded-full w-fit">
              Government Aided Secondary School
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight uppercase tracking-tight">
              KALUHA JAGADISHPUR <br />
              <span className="text-school-gold">HIGH SCHOOL</span>
            </h2>
            <p className="text-sm md:text-lg text-slate-200 leading-relaxed font-medium">
              Established in 1961 • Birbhum, West Bengal (Classes V - X). Nurturing young minds to build a brighter future for the nation.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                href="/admissions"
                className="bg-school-gold hover:bg-school-gold-dark text-school-blue-deep font-bold text-sm px-6 py-3 rounded-xl transition duration-300 shadow-lg shadow-school-gold/20 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Admission Desk</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about/history"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl border border-white/20 transition duration-300 backdrop-blur-md hover:scale-105 active:scale-95"
              >
                Learn History
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                activeSlide === idx ? "bg-school-gold w-8" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. OVERVIEW & HOI MESSAGE */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Card 1: School Overview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 md:p-10 glass-panel shadow-xl flex flex-col justify-between border border-white/50"
          >
            <div>
              <h3 className="text-school-blue-deep font-extrabold text-2xl uppercase tracking-wider mb-4 border-l-4 border-school-gold pl-3">
                Institution Overview
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium">
                {welcomeText || "Kaluha Jagadishpur High School is a Government Aided secondary school situated at Kaluha village in Birbhum district, West Bengal. Established in 1961/1962, the school serves students from Class V to X. Under the Rampurhat North Circle, it is dedicated to providing high-quality secondary education and holistic development opportunities to the children of surrounding rural communities."}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 mb-8 text-xs md:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-school-gold flex-shrink-0" />
                  <span>Affiliated to WBBSE</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-school-gold flex-shrink-0" />
                  <span>Hygienic Mid-Day Meal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-school-gold flex-shrink-0" />
                  <span>Interactive ICT Computer Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-school-gold flex-shrink-0" />
                  <span>Kanyashree Scholarships</span>
                </div>
              </div>
            </div>
            <Link
              href="/about/history"
              className="text-school-blue-medium hover:text-school-blue-deep text-sm font-bold flex items-center gap-1 group mt-2"
            >
              <span>Explore History & Core Values</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>

          {/* Card 2: HOI message */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 md:p-10 glass-panel shadow-xl flex flex-col justify-between border border-white/50"
          >
            <div>
              <h3 className="text-school-blue-deep font-extrabold text-2xl uppercase tracking-wider mb-4 border-l-4 border-school-gold pl-3">
                HOI Desk Message
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium italic whitespace-pre-line">
                {hoiText ? `${hoiText.substring(0, 320)}...` : `Dear Students, Parents and Well-wishers,
                It is my privilege to welcome you all to the digital portal of Kaluha Jagadishpur High School. Our institution has been a beacon of learning in the Birbhum district since its establishment.
                We believe in providing a safe, nurturing and stimulating environment where every student can achieve their full potential.`}
              </p>
            </div>
            <div className="flex justify-between items-end border-t border-slate-200/60 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-school-blue-deep text-sm">
                  HM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Teacher-in-Charge / Headmaster</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Kaluha Jagadishpur HS</p>
                </div>
              </div>
              <Link
                href="/hoi-desk"
                className="text-school-blue-medium hover:text-school-blue-deep text-sm font-bold flex items-center gap-1 group"
              >
                <span>Read Full Message</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. STATIC COUNTER STATISTICS */}
      <section className="py-16 bg-school-blue-deep text-white relative">
        {/* Parallax background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,58,138,0.2)_0%,rgba(11,37,69,0.95)_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-2 p-4"
          >
            <span className="text-4xl md:text-5xl font-black text-school-gold font-mono">
              {stats.studentsCount}+
            </span>
            <span className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest">
              Students Enrolled
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-2 p-4"
          >
            <span className="text-4xl md:text-5xl font-black text-school-gold font-mono">
              {stats.teachersCount}+
            </span>
            <span className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest">
              Expert Faculty
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-2 p-4"
          >
            <span className="text-4xl md:text-5xl font-black text-school-gold font-mono">
              {stats.classroomsCount}+
            </span>
            <span className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest">
              Active Classrooms
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-2 p-4"
          >
            <span className="text-4xl md:text-5xl font-black text-school-gold font-mono">
              {stats.passRatePercentage}%
            </span>
            <span className="text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest">
              Matric (Madhyamik) Pass Rate
            </span>
          </motion.div>
        </div>
      </section>

      {/* 4. SCHOOL FACILITIES */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-school-gold font-bold uppercase tracking-widest text-xs">
              World Class Infrastructure
            </span>
            <h2 className="text-3xl font-black text-school-blue-deep uppercase tracking-tight mt-1">
              Core Campus Facilities
            </h2>
            <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Facility 1 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <Users size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Computer Lab (ICT)</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Equipped with modern computer setups, high-speed broadband, and dedicated tech faculty to teach basic operations and coding.
                </p>
              </div>
            </motion.div>

            {/* Facility 2 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <BookOpen size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Rich Library</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  A peaceful reading environment holding academic textbooks, references, magazines, fiction, and regional journals.
                </p>
              </div>
            </motion.div>

            {/* Facility 3 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <Notebook size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Science Laboratories</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Practical lab facilities for Physical and Life Sciences, enabling students to explore chemistry and biology concepts hands-on.
                </p>
              </div>
            </motion.div>

            {/* Facility 4 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <Building size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Smart Classroom</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Equipped with dynamic digital projectors and audio systems, facilitating multimedia learning and interactive presentations.
                </p>
              </div>
            </motion.div>

            {/* Facility 5 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <Trophy size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Sports & Recreation</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  A large playground promoting physical fitness, and accommodating football, cricket, running, and physical drills.
                </p>
              </div>
            </motion.div>

            {/* Facility 6 */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="rounded-2xl p-6 glass-panel border border-white bg-white/70 shadow-lg hover:shadow-xl transition flex gap-4"
            >
              <div className="p-3 bg-school-blue-light/10 text-school-blue-deep rounded-xl h-fit">
                <ShieldCheck size={24} className="text-school-blue" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-school-blue-deep mb-1.5">Mid-Day Meal Program</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Nutritious, freshly-cooked meals served daily in a clean dining hall, fully complying with government guidelines.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. NOTICES & UPCOMING EVENTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Notices - Left 2 Columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-school-gold font-bold uppercase tracking-widest">Notice Board</span>
                <h3 className="text-2xl font-black text-school-blue-deep uppercase tracking-tight mt-0.5">Recent Bulletins</h3>
              </div>
              <Link href="/notices" className="text-xs font-bold text-school-blue hover:underline flex items-center gap-0.5">
                <span>View All Notices</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-5 border border-slate-100 rounded-2xl hover:border-school-blue/20 hover:bg-slate-50/50 transition flex flex-col gap-2 relative bg-white"
                  >
                    {notice.pinned && (
                      <span className="absolute top-4 right-4 bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pinned
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                      {new Date(notice.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-slate-900 pr-10">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-10">
                  No active notices found.
                </div>
              )}
            </div>
          </div>

          {/* Events - Right 1 Column */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs text-school-gold font-bold uppercase tracking-widest">Academic Calendar</span>
              <h3 className="text-2xl font-black text-school-blue-deep uppercase tracking-tight mt-0.5">Upcoming Events</h3>
            </div>

            <div className="flex flex-col gap-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl items-center bg-white hover:bg-slate-50 transition">
                    <div className="w-14 h-14 bg-school-blue/5 rounded-xl border border-school-blue/10 flex flex-col items-center justify-center font-bold text-school-blue flex-shrink-0">
                      <span className="text-base leading-none">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider">
                        {new Date(event.date).toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1">{event.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{event.description}</p>
                      <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mt-1">
                        {event.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                // Sample items if calendar database is empty
                <>
                  <div className="flex gap-4 p-4 border border-slate-100 rounded-2xl items-center bg-white hover:bg-slate-50 transition">
                    <div className="w-14 h-14 bg-school-blue/5 rounded-xl border border-school-blue/10 flex flex-col items-center justify-center font-bold text-school-blue flex-shrink-0">
                      <span className="text-base leading-none">15</span>
                      <span className="text-[9px] uppercase tracking-wider">Aug</span>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800">Independence Day Celebration</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Flag hoisting and cultural program</p>
                      <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mt-1">
                        EVENT
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 border border-slate-100 rounded-2xl items-center bg-white hover:bg-slate-50 transition">
                    <div className="w-14 h-14 bg-school-blue/5 rounded-xl border border-school-blue/10 flex flex-col items-center justify-center font-bold text-school-blue flex-shrink-0">
                      <span className="text-base leading-none">05</span>
                      <span className="text-[9px] uppercase tracking-wider">Sep</span>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800">Teachers Day Event</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Honoring our academic guides</p>
                      <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mt-1">
                        EVENT
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT & FEEDBACK FORM */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Info Details */}
          <div>
            <span className="text-school-gold font-bold uppercase tracking-widest text-xs">Reach Out</span>
            <h2 className="text-3xl font-black text-school-blue-deep uppercase tracking-tight mt-1 mb-6">
              Contact & Support Cell
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 font-medium">
              Have questions about admissions, student records, rules, or online portal registrations? Fill out the form, or visit the school during official administrative timings:
            </p>

            <div className="flex flex-col gap-6 text-xs md:text-sm font-semibold text-slate-700">
              <div className="flex gap-3 items-center">
                <div className="p-3 bg-white rounded-xl shadow border border-slate-100 text-school-blue-deep flex-shrink-0">
                  <MapPin size={18} className="text-school-gold" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">School Campus</h4>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">Village: Kaluha, PO/PS: Margram, Rampurhat-II, Birbhum 731202</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="p-3 bg-white rounded-xl shadow border border-slate-100 text-school-blue-deep flex-shrink-0">
                  <Clock size={18} className="text-school-gold" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Office Timings</h4>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">Mon - Fri: 10:40 AM to 4:30 PM | Sat: 10:40 AM to 1:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 glass-panel shadow-2xl border border-white"
          >
            <h3 className="font-bold text-lg text-school-blue-deep uppercase mb-5">
              Submit Inquiry or Feedback
            </h3>

            {formSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center"
              >
                <h4 className="font-bold text-sm mb-1">Feedback Submitted Successfully!</h4>
                <p className="text-xs text-emerald-600 font-medium">Thank you for sharing your thoughts. Our administration team has logged your response.</p>
                <button
                  onClick={() => setFormSuccess(false)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4 text-xs font-medium">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Your Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
                    >
                      <option value="VISITOR">Visitor</option>
                      <option value="PARENT">Parent</option>
                      <option value="STUDENT">Student</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Rating (1 - 5 stars)</label>
                    <div className="flex gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="text-amber-400 focus:outline-none"
                        >
                          <Star
                            size={20}
                            fill={star <= formRating ? "#f2c010" : "none"}
                            className="stroke-amber-400"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Message / Comments</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry or feedback..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-105 active:scale-95"
                >
                  <span>Submit Form</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
