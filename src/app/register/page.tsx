"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";

// Schema for registration validation
const registerSchema = zod.object({
  name: zod.string().min(3, "Full name must be at least 3 characters"),
  fatherName: zod.string().optional().or(zod.literal("")),
  className: zod.string().optional().or(zod.literal("")),
  rollNumber: zod.string().optional().or(zod.literal("")),
  dob: zod.string().optional().or(zod.literal("")),
  username: zod.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: zod.string().email("Invalid email address"),
  mobile: zod.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Confirm password must be at least 8 characters"),
  role: zod.enum(["STUDENT", "FACULTY"])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).superRefine((data, ctx) => {
  if (data.role === "STUDENT") {
    if (!data.fatherName || data.fatherName.length < 3) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "Father's/Guardian's name is required for students",
        path: ["fatherName"]
      });
    }
    if (!data.className || !["Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"].includes(data.className)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "Please select a valid class (Class V to X)",
        path: ["className"]
      });
    }
    if (!data.dob) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: "Date of birth is required for students",
        path: ["dob"]
      });
    }
  }
});

type RegisterForm = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUsername, setRegisteredUsername] = useState("");
  const [receivedOtp, setReceivedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" }
  });

  const role = watch("role", "STUDENT");

  const onRegisterSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          fatherName: data.fatherName,
          className: data.className,
          rollNumber: data.rollNumber,
          dob: data.dob,
          username: data.username,
          email: data.email,
          mobile: data.mobile,
          password: data.password,
          role: data.role
        })
      });
      const result = await res.json();
      if (result.success) {
        setRegisteredUsername(result.username);
        setReceivedOtp(result.otp); // Will display this to the user in this simulation
        setStep(2);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registeredUsername,
          otp: enteredOtp
        })
      });
      const result = await res.json();
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error);
      }
    } catch {
      setError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 relative min-h-[85vh]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,64,116,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-3xl glass-panel shadow-2xl border border-white bg-white/70 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-school-blue mx-auto mb-4 flex items-center justify-center shadow-md">
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
          <h2 className="font-extrabold text-xl text-school-blue-deep uppercase tracking-wide">
            Portal Registration
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Create Student or Faculty Account
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <form onSubmit={handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4 text-xs font-semibold">
                {/* Role Select (Moved to Top) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Account Type / Role</label>
                  <select
                    {...register("role")}
                    className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-school-blue w-full"
                  >
                    <option value="STUDENT">Student Profile</option>
                    <option value="FACULTY">Faculty / Teacher Profile</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("name")}
                        placeholder="Enter full name"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
                  </div>

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Username (Unique)</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("username")}
                        placeholder="Enter username"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.username && <p className="text-red-500 text-[10px] mt-0.5">{errors.username.message}</p>}
                  </div>
                </div>

                {/* CONDITIONAL STUDENT REGISTRATION INPUTS */}
                {role === "STUDENT" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Father's Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Father's / Guardian's Name</label>
                        <input
                          type="text"
                          {...register("fatherName")}
                          placeholder="Enter father's name"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                        />
                        {errors.fatherName && <p className="text-red-500 text-[10px] mt-0.5">{errors.fatherName.message}</p>}
                      </div>

                      {/* DOB */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Date of Birth</label>
                        <input
                          type="date"
                          {...register("dob")}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                        />
                        {errors.dob && <p className="text-red-500 text-[10px] mt-0.5">{errors.dob.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Enrollment Class (Mandatory)</label>
                        <select
                          {...register("className")}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                        >
                          <option value="">Select Class</option>
                          <option value="Class V">Class V</option>
                          <option value="Class VI">Class VI</option>
                          <option value="Class VII">Class VII</option>
                          <option value="Class VIII">Class VIII</option>
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                        </select>
                        {errors.className && <p className="text-red-500 text-[10px] mt-0.5">{errors.className.message}</p>}
                      </div>

                      {/* Roll number (optional) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-600">Roll Number (Optional)</label>
                        <input
                          type="text"
                          {...register("rollNumber")}
                          placeholder="E.g. 15"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="Enter email address"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
                  </div>

                  {/* Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Mobile Number (10 digits)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("mobile")}
                        placeholder="Enter phone number"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.mobile && <p className="text-red-500 text-[10px] mt-0.5">{errors.mobile.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-600">Confirm Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        {...register("confirmPassword")}
                        placeholder="••••••"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
                      />
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-0.5">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{loading ? "Registering..." : "Send Verification OTP"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-2xl flex flex-col gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-600" />
                  <span>OTP Code Sent to Email & Mobile!</span>
                </span>
                <p className="text-[10px] text-amber-600">
                  For verification testing, please enter the simulated OTP code: <span className="font-black underline text-sm">{receivedOtp}</span>.
                </p>
              </div>

              <form onSubmit={onVerifyOtp} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="E.g. 123456"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-center text-lg font-black tracking-widest focus:outline-none focus:border-school-blue"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{loading ? "Verifying..." : "Verify OTP & Create Account"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-4 py-6"
            >
              <CheckCircle size={48} className="text-emerald-500" />
              <h3 className="font-extrabold text-slate-800 text-lg">
                {role === "STUDENT" ? "Registration Submitted!" : "Account Verified & Active!"}
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                {role === "STUDENT" 
                  ? "Your registration has been submitted successfully and is awaiting approval from the school administrator."
                  : "Your portal profile is successfully registered and approved. You can now access your dashboard using your username and password."}
              </p>
              <Link
                href="/login"
                className="bg-school-gold hover:bg-school-gold-dark text-school-blue-deep font-bold text-xs px-6 py-3 rounded-xl transition duration-300 shadow-md hover:scale-105"
              >
                Go to Login Portal
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 font-semibold">
          Already have a portal account?{" "}
          <Link href="/login" className="text-school-blue hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </motion.div>

      {/* Simulated Smartphone for SMS OTP Notification */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed bottom-6 right-6 z-50 w-72 h-[450px] bg-slate-900 rounded-[45px] border-8 border-slate-800 shadow-2xl overflow-hidden hidden lg:flex flex-col select-none"
        >
          {/* Status Bar / Notch */}
          <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 flex items-center justify-between px-6 z-20">
            <span className="text-[9px] font-bold text-white">9:41</span>
            <div className="w-16 h-3 bg-black rounded-b-md mx-auto absolute top-0 left-1/2 -translate-x-1/2" />
            <div className="flex gap-1 items-center">
              <div className="w-4 h-2 border border-white rounded-[2px] p-[1px] flex items-center">
                <div className="w-full h-full bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 bg-slate-950 pt-8 p-4 flex flex-col justify-start relative">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500')]" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Lock Screen Time */}
            <div className="text-center text-white relative z-10 my-4">
              <h1 className="text-4xl font-extrabold tracking-tight">09:41</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-1">Sunday, 19 July</p>
            </div>

            {/* SMS Notification Banner */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 120 }}
              className="mt-6 p-3.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 relative z-10 flex gap-2.5 items-start cursor-pointer hover:bg-white transition"
              onClick={() => {
                setEnteredOtp(receivedOtp);
              }}
            >
              <div className="p-2 bg-green-500 text-white rounded-lg flex-shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
              </div>
              <div className="flex-1 text-[11px] font-semibold text-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 uppercase text-[9px] tracking-wider">MESSAGES</span>
                  <span className="text-[9px] text-slate-400 font-bold">now</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-1 text-left">MD-KJHS</h4>
                <p className="text-slate-600 mt-0.5 text-justify text-[10px] leading-relaxed">
                  Your Kaluha Jagadishpur High School Portal verification OTP is <span className="font-black text-school-blue underline">{receivedOtp}</span>. Valid for 5 minutes.
                </p>
                <div className="text-school-blue text-[9px] font-black uppercase mt-1.5 text-right hover:underline">
                  ⚡ Click to autofill code
                </div>
              </div>
            </motion.div>
          </div>

          {/* Home Indicator Bar */}
          <div className="h-6 bg-slate-950 flex items-center justify-center relative z-20">
            <div className="w-24 h-1 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
