"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { Lock, User, LogIn, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

const schema = zod.object({
  username: zod.string().min(3, "Username must be at least 3 characters"),
  password: zod.string().min(8, "Password must be at least 8 characters")
});

type LoginForm = zod.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await login(data.username, data.password);
      if (res && res.user) {
        const role = res.user.role.toLowerCase();
        router.push(`/dashboard/${role}`);
        router.refresh();
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 relative min-h-[80vh]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,64,116,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-white bg-white/70 relative z-10"
      >
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
            School Portal Login
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Access Dashboard Account
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-semibold">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-600">Username</label>
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-600">Password</label>
              <a href="#" onClick={() => alert("Please contact the school IT support cell or Headmaster to reset your portal password.")} className="text-school-blue hover:underline text-[10px]">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-school-blue"
              />
              <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Log In to Account"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 font-semibold">
          Don't have a portal account?{" "}
          <Link href="/register" className="text-school-gold-dark hover:underline font-bold">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
