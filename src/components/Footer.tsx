"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, Phone, Mail, ArrowUp, Send, GraduationCap 
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      // Fallback local success indicator
      setSubscribed(true);
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <footer className="bg-slate-950 text-slate-300 relative border-t-2 border-school-gold pt-16 pb-8">
      {/* Decorative background vectors */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(19,64,116,0.15)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        {/* Column 1: School Brand & Newsletter */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-school-gold p-0.5 flex items-center justify-center">
              <img 
                src="https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/31776.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-school-blue-deep font-bold text-xs">KJHS</span>
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm tracking-wide uppercase">
                KALUHA JAGADISHPUR HS
              </h3>
              <p className="text-[10px] text-school-gold font-bold uppercase tracking-wider">
                Govt. Aided Secondary School
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            Established in 1961/1962, providing excellence in education (Classes V to X) under the West Bengal Board of Secondary Education.
          </p>

          <div className="mt-4">
            <h4 className="text-xs text-white font-bold tracking-wider uppercase mb-2">
              Subscribe to Newsletter
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-school-gold w-full text-slate-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-school-gold hover:bg-school-gold-dark text-school-blue-deep px-3 py-2 rounded-lg font-bold transition flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                {subscribed ? "Subbed!" : <Send size={14} />}
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-l-2 border-school-gold pl-2 mb-5">
            Quick Links
          </h3>
          <ul className="text-xs flex flex-col gap-2.5">
            <li>
              <a href="https://banglarshiksha.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-school-gold transition">
                Banglar Shiksha Portal
              </a>
            </li>
            <li>
              <a href="https://wbbse.wb.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-school-gold transition">
                WBBSE Official Site
              </a>
            </li>
            <li>
              <a href="https://wbchse.wb.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-school-gold transition">
                WBCHSE Official Site
              </a>
            </li>
            <li>
              <a href="https://wbsche.wb.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-school-gold transition">
                Higher Education WB
              </a>
            </li>
            <li>
              <Link href="/admissions#apply" className="hover:text-school-gold transition">
                Online Admission Apply
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Info */}
        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-l-2 border-school-gold pl-2 mb-5">
            Contact Details
          </h3>
          <ul className="text-xs flex flex-col gap-3">
            <li className="flex gap-2.5 items-start">
              <MapPin size={15} className="text-school-gold flex-shrink-0 mt-0.5" />
              <span>
                Village: Kaluha, P.O. Margram, P.S. Margram, Block: Rampurhat-II, Dist: Birbhum, West Bengal, PIN 731202
              </span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone size={15} className="text-school-gold flex-shrink-0" />
              <span>+91 9434582037</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail size={15} className="text-school-gold flex-shrink-0" />
              <span>kaluhajhighschool@gmail.com</span>
            </li>
          </ul>

          <div className="flex gap-3.5 mt-5">
            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-school-gold transition flex items-center justify-center" aria-label="Facebook">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-3 0-5 2-5 5v2z"/>
              </svg>
            </a>
            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-school-gold transition flex items-center justify-center" aria-label="Twitter X">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.2 2.4h6.9l4.7 6.2 5.4-6.2zm-1.2 17.6h1.8L7.1 4.3H5.1l11.9 15.7z"/>
              </svg>
            </a>
            <a href="#" className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-school-gold transition flex items-center justify-center" aria-label="YouTube">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-1-1.9-1-2.4-1C16.6 2.6 12 2.6 12 2.6s-4.6 0-8.2.3c-.5 0-1.5 0-2.4 1-.7.7-.9 2.3-.9 2.3S.3 8.2.3 10.1v3.8c0 1.9.3 3.9.3 3.9s.2 1.6.9 2.3c.9 1 2 1 2.5 1 3.6.3 8 .3 8 .3s4.6 0 8.2-.3c.5 0 1.5 0 2.4-1 .7-.7.9-2.3.9-2.3s.3-2 .3-3.9v-3.8c0-1.9-.3-3.9-.3-3.9zM9.5 15.4V8.6l6.5 3.4-6.5 3.4z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 4: Interactive Map */}
        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-l-2 border-school-gold pl-2 mb-5">
            School Location
          </h3>
          <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
            {/* Embedded Google Maps frame for Margram / Rampurhat region */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14588.665796030999!2d87.876798!3d23.910398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f98bb2f073faab%3A0xe5a36371d798aa1b!2sMargram%2C%20West%20Bengal%20731224!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 opacity-75"
            />
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500 flex flex-col gap-2">
        <p>
          Copyright &copy; {new Date().getFullYear()} Kaluha Jagadishpur High School. All rights reserved.
        </p>
        <p className="max-w-3xl mx-auto leading-relaxed">
          Disclaimer: All efforts have been made to make the information as accurate as possible. Govt. of West Bengal or Webel Technology Limited (WTL), will not be responsible for any loss to any person caused by inaccuracy in the information available on this website.
        </p>
      </div>

      {/* Floating Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-school-gold text-school-blue-deep p-3 rounded-full hover:bg-school-gold-dark hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl border border-white/20"
          title="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </footer>
  );
}
