"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileCheck, CheckCircle } from "lucide-react";

interface SMCMember {
  id: string;
  name: string;
  designation: string;
}

export default function SMCPage() {
  const [members, setMembers] = useState<SMCMember[]>([]);

  useEffect(() => {
    fetch("/api/smc")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setMembers(data.data);
        } else {
          // Fallback list
          setMembers([
            { id: "1", name: "Anil Chandra Ghosh", designation: "President" },
            { id: "2", name: "Subrata Sen", designation: "Secretary (HOI Representative)" },
            { id: "3", name: "Pradip Kumar Das", designation: "Guardian Representative" },
            { id: "4", name: "Minati Roy", designation: "Female Guardian Representative" },
            { id: "5", name: "Tapan Chowdhury", designation: "Local Authority Nominee" }
          ]);
        }
      })
      .catch(() => {
        setMembers([
          { id: "1", name: "Anil Chandra Ghosh", designation: "President" },
          { id: "2", name: "Subrata Sen", designation: "Secretary (HOI Representative)" },
          { id: "3", name: "Pradip Kumar Das", designation: "Guardian Representative" },
          { id: "4", name: "Minati Roy", designation: "Female Guardian Representative" },
          { id: "5", name: "Tapan Chowdhury", designation: "Local Authority Nominee" }
        ]);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          SMC
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          School Management Committee
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 rounded-3xl border border-white shadow-xl mb-10 text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify"
      >
        <p>
          The School Management Committee (SMC) of Kaluha Jagadishpur High School works under the guidelines of the West Bengal Right to Education (RTE) rules. It focuses heavily on parent representation, monitoring school operations, ensuring student retention, overseeing the utilization of grants, and maintaining the Mid-Day Meal standards.
        </p>
      </motion.div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="flex gap-4 p-5 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition shadow-sm items-center"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                {member.name}
              </h4>
              <p className="text-school-blue font-bold text-xs uppercase tracking-wider mt-0.5">
                {member.designation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
