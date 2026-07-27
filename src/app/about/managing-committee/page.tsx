"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Mail, CircleAlert } from "lucide-react";

interface Member {
  id: string;
  name: string;
  designation: string;
}

export default function ManagingCommittee() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/managing-committee")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setMembers(data.data);
        } else {
          // Fallback members
          setMembers([
            { id: "1", name: "Samarjit Mondal", designation: "President" },
            { id: "2", name: "Subrata Sen", designation: "Secretary (Teacher-in-Charge)" },
            { id: "3", name: "Pradip Kumar Das", designation: "Teacher Representative" },
            { id: "4", name: "Minati Roy", designation: "Guardian Representative" },
            { id: "5", name: "Srinath Sen", designation: "Government Nominee" }
          ]);
        }
      })
      .catch(() => {
        setMembers([
          { id: "1", name: "Samarjit Mondal", designation: "President" },
          { id: "2", name: "Subrata Sen", designation: "Secretary (Teacher-in-Charge)" },
          { id: "3", name: "Pradip Kumar Das", designation: "Teacher Representative" },
          { id: "4", name: "Minati Roy", designation: "Guardian Representative" },
          { id: "5", name: "Srinath Sen", designation: "Government Nominee" }
        ]);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-3 py-1 rounded-full border border-school-gold/20">
          Governance
        </span>
        <h2 className="text-3xl font-black text-school-blue-deep uppercase mt-2 tracking-tight">
          Managing Committee
        </h2>
        <div className="w-16 h-1 bg-school-gold mx-auto mt-3 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 rounded-3xl border border-white shadow-xl mb-10 text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify"
      >
        <p>
          The Managing Committee of Kaluha Jagadishpur High School is the apex governing body responsible for institutional administration, implementation of educational guidelines, campus maintenance, and financial supervision. Composed of community leaders, teacher representatives, and government nominees, the committee works in close partnership with the Headmaster to sustain quality standards.
        </p>
      </motion.div>

      {/* Members List */}
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
            <div className="p-3 bg-school-blue/5 text-school-blue rounded-xl flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                {member.name}
              </h4>
              <p className="text-school-gold-dark text-xs font-bold uppercase tracking-wider mt-0.5">
                {member.designation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
