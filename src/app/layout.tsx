import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Preloader from "@/components/Preloader";
import FloatingObjects from "@/components/FloatingObjects";
import Navbar from "@/components/Navbar";
import NotificationBanner from "@/components/NotificationBanner";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaluha Jagadishpur High School | Govt. Aided West Bengal",
  description: "Official portal of Kaluha Jagadishpur High School, Birbhum, West Bengal. Established in 1961. Classes V to X secondary education.",
  keywords: "Kaluha Jagadishpur High School, Government High School West Bengal, Birbhum School, Margram School, WBBSE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-slate-50 text-slate-900 selection:bg-school-gold selection:text-school-blue-deep">
        <Providers>
          {/* Animated Loader */}
          <Preloader />

          {/* Floating Educational Graphics in Background */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <FloatingObjects />
          </div>

          {/* Header & Sticky Nav */}
          <div className="z-30">
            <Navbar />
            <NotificationBanner />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col z-10 relative">
            {children}
          </main>

          {/* Footer Section */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
