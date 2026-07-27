"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, AlertCircle, Award, Calendar } from "lucide-react";

const querySchema = zod.object({
  className: zod.enum(["V", "VI", "VII", "VIII", "IX", "X"]),
  rollNumber: zod.string().min(1, "Roll number is required"),
  dob: zod.string().min(1, "Date of Birth is required")
});

type QueryForm = zod.infer<typeof querySchema>;

export default function ResultsLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<QueryForm>({
    resolver: zodResolver(querySchema)
  });

  const onSubmit = async (data: QueryForm) => {
    setLoading(true);
    setError(null);
    setResultsList([]);
    setSelectedResult(null);
    try {
      const query = new URLSearchParams({
        className: data.className,
        rollNumber: data.rollNumber,
        dob: data.dob
      });

      const res = await fetch(`/api/results?${query.toString()}`);
      const responseData = await res.json();

      if (responseData.success && Array.isArray(responseData.data) && responseData.data.length > 0) {
        setResultsList(responseData.data);
        setSelectedResult(responseData.data[0]);
      } else {
        setError("No matching result found. Please check class, roll, and DOB, or contact the school office.");
      }
    } catch {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getParsedMarks = (marksJson: string) => {
    try {
      return JSON.parse(marksJson);
    } catch {
      return {};
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Academic Desk
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Report Card Lookup
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Form Column */}
        <div className="glass-panel p-6 rounded-3xl border border-white bg-white/70 shadow-xl flex flex-col gap-4 text-xs font-semibold">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">
            Enter Lookup Details
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Select Class</label>
              <select
                {...register("className", { required: true })}
                className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
              >
                <option value="V">Class V</option>
                <option value="VI">Class VI</option>
                <option value="VII">Class VII</option>
                <option value="VIII">Class VIII</option>
                <option value="IX">Class IX</option>
                <option value="X">Class X</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Roll Number</label>
              <input
                type="text"
                {...register("rollNumber", { required: true })}
                placeholder="E.g. 12"
                className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-school-blue"
              />
              {errors.rollNumber && <span className="text-red-500 text-[10px]">{errors.rollNumber.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-600">Date of Birth</label>
              <input
                type="date"
                {...register("dob", { required: true })}
                className="bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-school-blue"
              />
              {errors.dob && <span className="text-red-500 text-[10px]">{errors.dob.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-school-blue hover:bg-school-blue-deep text-white font-bold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Search size={13} />
              <span>{loading ? "Searching..." : "Search Report Card"}</span>
            </button>
          </form>
        </div>

        {/* Results/Report Column */}
        <div className="lg:col-span-2">
          {error && (
            <div className="p-5 border border-red-200 bg-red-50 text-red-700 text-xs font-semibold rounded-3xl flex items-start gap-3 shadow">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Lookup Failed</h4>
                <p className="text-red-500 font-medium mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {resultsList.length === 0 && !error && (
            <div className="text-center text-slate-400 py-20 font-medium text-sm border border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center gap-3">
              <FileText size={40} className="text-slate-300" />
              <span>Fill out the details on the left (Class, Roll Number, and DOB) to lookup student report cards.</span>
            </div>
          )}

          {resultsList.length > 0 && selectedResult && (
            <div className="flex flex-col gap-6">
              
              {/* Term Selection tabs if multiple reports found */}
              {resultsList.length > 1 && (
                <div className="flex gap-2 border-b pb-2">
                  {resultsList.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResult(r)}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-xl transition cursor-pointer ${
                        selectedResult.id === r.id
                          ? "bg-school-blue text-white"
                          : "bg-slate-100 text-slate-655 hover:bg-slate-200"
                      }`}
                    >
                      {r.examType}
                    </button>
                  ))}
                </div>
              )}

              <motion.div
                key={selectedResult.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 md:p-8 border border-slate-100 rounded-3xl bg-white shadow-xl flex flex-col gap-6"
              >
                {/* Report Card Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] bg-school-gold/15 text-school-blue-deep font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Official Report Card
                    </span>
                    <h3 className="font-black text-slate-800 text-base md:text-lg mt-2">
                      {selectedResult.studentName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Class {selectedResult.className} • Roll Number: {selectedResult.rollNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedResult.examType}</span>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1 bg-emerald-50 px-2 py-0.5 rounded w-fit ml-auto">
                      {selectedResult.status}
                    </p>
                  </div>
                </div>

                {/* Marks breakdown & Graph */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Subject wise marks */}
                  <div className="flex flex-col gap-2.5 text-xs font-semibold">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 border-b border-slate-50 pb-1">
                      Subject Wise Marks
                    </h4>
                    {Object.entries(getParsedMarks(selectedResult.subjectMarks)).map(([subject, mark]: any) => (
                      <div key={subject} className="flex justify-between items-center text-slate-700">
                        <span>{subject}</span>
                        <span className="font-black text-slate-900">{mark} / 100</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-slate-900 border-t border-slate-100 pt-3 text-sm font-bold">
                      <span>Aggregate Total</span>
                      <span>{selectedResult.totalMarks} Marks</span>
                    </div>
                    <div className="flex justify-between items-center text-school-blue-deep text-sm font-black">
                      <span>Percentage</span>
                      <span>{selectedResult.percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Vertical CSS Bar Graph */}
                  <div className="p-4 border border-slate-50 rounded-2xl bg-slate-50/50 flex flex-col gap-4">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100 pb-1 text-center">
                      Performance Graph (%)
                    </h4>
                    <div className="flex justify-around items-end h-32 pt-4">
                      {Object.entries(getParsedMarks(selectedResult.subjectMarks)).map(([subject, mark]: any) => (
                        <div key={subject} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[9px] font-black text-school-blue opacity-0 group-hover:opacity-100 transition duration-155">
                            {mark}
                          </span>
                          <div
                            style={{ height: `${mark}%` }}
                            className={`w-4 rounded-t-sm transition-all duration-500 ${
                              mark >= 75
                                ? "bg-emerald-500 shadow-sm"
                                : mark >= 60
                                ? "bg-school-blue shadow-sm"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {subject.substring(0, 3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
