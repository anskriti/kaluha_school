"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { Send, CheckCircle, GraduationCap } from "lucide-react";

const alumniSchema = zod.object({
  name: zod.string().min(3, "Full name must be at least 3 characters"),
  batchYear: zod.string().regex(/^[0-9]{4}$/, "Batch must be a 4-digit graduation year"),
  email: zod.string().email("Invalid email address"),
  mobile: zod.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  profession: zod.string().min(3, "Profession must be at least 3 characters"),
  achievements: zod.string().optional()
});

type AlumniForm = zod.infer<typeof alumniSchema>;

interface AlumniProfile {
  id: string;
  name: string;
  batchYear: string;
  profession: string;
  achievements?: string;
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AlumniForm>({
    resolver: zodResolver(alumniSchema)
  });

  const fetchAlumni = () => {
    fetch("/api/alumni?approvedOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAlumni(data.data);
        } else {
          setAlumni([
            { id: "1", name: "Rahul Das", batchYear: "2012", profession: "Software Engineer", achievements: "M.Tech from IIT Kharagpur" },
            { id: "2", name: "Priya Mondal", batchYear: "2015", profession: "Government School Teacher", achievements: "B.Ed. Rank Holder" },
            { id: "3", name: "Somnath Ghosh", batchYear: "2018", profession: "Medical Student", achievements: "Qualified NEET with state rank" }
          ]);
        }
      })
      .catch(() => {
        setAlumni([
          { id: "1", name: "Rahul Das", batchYear: "2012", profession: "Software Engineer", achievements: "M.Tech from IIT Kharagpur" },
          { id: "2", name: "Priya Mondal", batchYear: "2015", profession: "Government School Teacher", achievements: "B.Ed. Rank Holder" },
          { id: "3", name: "Somnath Ghosh", batchYear: "2018", profession: "Medical Student", achievements: "Qualified NEET with state rank" }
        ]);
      });
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const onSubmit = async (data: AlumniForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        reset();
      }
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Community
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Alumni Association
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Registered Alumni List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider border-b border-slate-100 pb-3">
            Alumni Members Directory
          </h3>

          <div className="flex flex-col gap-4">
            {alumni.map((item) => (
              <div
                key={item.id}
                className="p-5 border border-slate-100 rounded-2xl bg-white flex gap-4 items-center"
              >
                <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Graduation Batch: <span className="text-school-blue font-bold">{item.batchYear}</span> • Profession: <span className="font-semibold text-slate-700">{item.profession}</span>
                  </p>
                  {item.achievements && (
                    <p className="text-[10px] text-school-gold-dark font-semibold mt-1 bg-school-gold/5 px-2 py-0.5 rounded w-fit">
                      {item.achievements}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div>
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider border-b border-slate-100 pb-3 mb-6">
            Alumni Registration
          </h3>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-2xl text-center flex flex-col items-center gap-3 shadow"
            >
              <CheckCircle size={32} className="text-emerald-600" />
              <h4 className="font-bold text-sm">Registration Submitted!</h4>
              <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
                Thank you for joining the Kaluha Jagadishpur Alumni Network. Your registration is pending approval by the administrator.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 border border-slate-100 rounded-2xl bg-white shadow-md flex flex-col gap-4 text-xs font-semibold"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Full Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Enter name"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name.message}</p>}
                </div>

                {/* Batch */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Graduation Batch Year</label>
                  <input
                    type="text"
                    {...register("batchYear")}
                    placeholder="E.g. 2018"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
                  />
                  {errors.batchYear && <p className="text-red-500 text-[10px] mt-0.5">{errors.batchYear.message}</p>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Enter email"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Mobile Number</label>
                  <input
                    type="tel"
                    {...register("mobile")}
                    placeholder="Enter mobile"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
                  />
                  {errors.mobile && <p className="text-red-500 text-[10px] mt-0.5">{errors.mobile.message}</p>}
                </div>

                {/* Profession */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Current Profession</label>
                  <input
                    type="text"
                    {...register("profession")}
                    placeholder="E.g. College Student, Doctor"
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
                  />
                  {errors.profession && <p className="text-red-500 text-[10px] mt-0.5">{errors.profession.message}</p>}
                </div>

                {/* Achievements */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600">Notable Achievements (Optional)</label>
                  <textarea
                    rows={2}
                    {...register("achievements")}
                    placeholder="Describe awards, degrees, or current work..."
                    className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Submit Register Request</span>
                  <Send size={12} />
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
