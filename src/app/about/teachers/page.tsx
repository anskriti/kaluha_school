"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Phone, CalendarRange, Camera, Upload, X, Check, Image as ImageIcon, Sparkles, Filter, UserCheck } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  subjects: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  joinDate?: string;
  category?: string;
}

const OFFICIAL_STAFF_LIST: Teacher[] = [
  {
    id: "1",
    name: "MANABENDRA MONDAL",
    designation: "HEAD MASTER",
    qualification: "M.A., B.Ed.",
    subjects: "School Administration & Leadership",
    category: "HEAD MASTER"
  },
  {
    id: "2",
    name: "PRIYOJYOTI BHATTACHARYYA",
    designation: "ASSISTANT TEACHER",
    qualification: "M.A., B.Ed.",
    subjects: "English",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "3",
    name: "SOMESHWAR MURMU",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A. (Hons.), B.Ed.",
    subjects: "History",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "4",
    name: "DEBDULAL BHATTACHARYYA",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., B.Ed.",
    subjects: "Bengali",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "5",
    name: "SANDIP CHOUDHURY",
    designation: "ASSISTANT TEACHER",
    qualification: "M.Sc., B.Ed.",
    subjects: "Life Science",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "6",
    name: "PARTHO PROTIM DAS",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A. (Hons.), B.Ed.",
    subjects: "Mathematics",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "7",
    name: "MD ARIF",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A./M.A., B.Ed.",
    subjects: "English",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "8",
    name: "TOTON LET",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., B.Ed.",
    subjects: "Sanskrit",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "9",
    name: "NABA KUMAR SAHA",
    designation: "ASSISTANT TEACHER",
    qualification: "M.Sc., B.Ed.",
    subjects: "Physical Science",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "10",
    name: "TARAK NATH MONDAL",
    designation: "ASSISTANT TEACHER",
    qualification: "B.A., P.P.Ed., B.Ed.",
    subjects: "Physical Education",
    category: "ASSISTANT TEACHER"
  },
  {
    id: "12",
    name: "SRIKANTA MONDAL",
    designation: "Group D Staff",
    qualification: "Higher Secondary",
    subjects: "General Support Staff",
    category: "OFFICE & SUPPORT STAFF"
  },
  {
    id: "14",
    name: "ANAMIKA CHATTERJEE",
    designation: "PARA TEACHER",
    qualification: "B.A.",
    subjects: "Bengali",
    category: "PARA TEACHER"
  },
  {
    id: "15",
    name: "HASINA KHAUN",
    designation: "PARA TEACHER",
    qualification: "B.Sc., D.El.Ed.",
    subjects: "Science",
    category: "PARA TEACHER"
  },
  {
    id: "16",
    name: "HAIDER ALI",
    designation: "PARA TEACHER",
    qualification: "B.A., D.El.Ed.",
    subjects: "Geography",
    category: "PARA TEACHER"
  },
  {
    id: "17",
    name: "MD. NISAR",
    designation: "COMPUTER TEACHER",
    qualification: "M.A. (Computer)",
    subjects: "Computer Science",
    category: "COMPUTER TEACHER"
  }
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTeacherForPhoto, setSelectedTeacherForPhoto] = useState<Teacher | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");

  // Helper to load photos stored locally
  const getStoredPhotos = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("kaluha_staff_photos");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Helper to save photo locally & trigger API update
  const saveStoredPhoto = (teacherId: string, photoUrl: string) => {
    const photos = getStoredPhotos();
    if (photoUrl) {
      photos[teacherId] = photoUrl;
    } else {
      delete photos[teacherId];
    }
    localStorage.setItem("kaluha_staff_photos", JSON.stringify(photos));
  };

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        const storedPhotos = getStoredPhotos();
        
        let mergedList = OFFICIAL_STAFF_LIST.map((staff) => {
          // Check if DB has data for this staff
          const dbItem = data.success && Array.isArray(data.data) 
            ? data.data.find((d: any) => d.name.trim().toUpperCase() === staff.name.trim().toUpperCase() || d.id === staff.id)
            : null;
          
          const finalImage = storedPhotos[staff.id] || dbItem?.imageUrl || "";
          return {
            ...staff,
            id: dbItem?.id || staff.id,
            imageUrl: finalImage,
            phone: dbItem?.phone || staff.phone,
            email: dbItem?.email || staff.email,
            joinDate: dbItem?.joinDate || staff.joinDate
          };
        });

        setTeachers(mergedList);
      })
      .catch(() => {
        const storedPhotos = getStoredPhotos();
        setTeachers(OFFICIAL_STAFF_LIST.map(t => ({ ...t, imageUrl: storedPhotos[t.id] || "" })));
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter teachers based on selected tab category
  const filteredTeachers = teachers.filter((t) => {
    const des = t.designation.toUpperCase();
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "HEAD MASTER") return des.includes("HEAD MASTER");
    if (selectedCategory === "ASSISTANT TEACHER") return des.includes("ASSISTANT TEACHER");
    if (selectedCategory === "PARA TEACHER") return des.includes("PARA TEACHER");
    if (selectedCategory === "COMPUTER TEACHER") return des.includes("COMPUTER TEACHER");
    if (selectedCategory === "OFFICE & SUPPORT STAFF") return des.includes("CLERK") || des.includes("GR. D") || des.includes("GROUP D");
    return true;
  });

  const handleOpenPhotoModal = (teacher?: Teacher) => {
    const target = teacher || teachers[0];
    setSelectedTeacherForPhoto(target);
    setPhotoInputUrl(target?.imageUrl || "");
    setUploadSuccessMsg("");
    setIsPhotoModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoInputUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedTeacherForPhoto) return;

    const updatedPhotoUrl = photoInputUrl.trim();

    // 1. Update State immediately
    setTeachers((prev) =>
      prev.map((t) => (t.id === selectedTeacherForPhoto.id ? { ...t, imageUrl: updatedPhotoUrl } : t))
    );

    // 2. Persist in LocalStorage
    saveStoredPhoto(selectedTeacherForPhoto.id, updatedPhotoUrl);

    // 3. Sync with DB API
    try {
      await fetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTeacherForPhoto.id,
          imageUrl: updatedPhotoUrl
        })
      });
    } catch (err) {
      console.log("Database update failed, photo saved in local session", err);
    }

    setUploadSuccessMsg("Photo updated successfully!");
    setTimeout(() => {
      setIsPhotoModalOpen(false);
      setUploadSuccessMsg("");
    }, 1200);
  };

  const getDesignationBadgeColor = (designation: string) => {
    if (designation.includes("HEAD MASTER")) return "bg-amber-100 text-amber-900 border-amber-300 font-extrabold";
    if (designation.includes("ASSISTANT TEACHER")) return "bg-blue-50 text-blue-800 border-blue-200";
    if (designation.includes("PARA TEACHER")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (designation.includes("COMPUTER TEACHER")) return "bg-purple-50 text-purple-800 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <span className="text-xs text-school-gold font-bold uppercase tracking-widest bg-school-gold/10 px-4 py-1.5 rounded-full border border-school-gold/20 inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles size={14} className="text-school-gold" />
          School Staff Directory
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-school-blue-deep uppercase mt-3 tracking-tight">
          Our Dedicated Educators & Staff
        </h1>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto mt-2 font-medium">
          Official staff list of Kaluha High School comprising 15 dedicated members serving our students with excellence.
        </p>
        <div className="w-20 h-1 bg-school-gold mx-auto mt-4 rounded-full" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-2 border-b border-slate-200">
        {[
          { label: "All Staff (15)", value: "ALL" },
          { label: "Head Master (1)", value: "HEAD MASTER" },
          { label: "Assistant Teachers (9)", value: "ASSISTANT TEACHER" },
          { label: "Para Teachers (3)", value: "PARA TEACHER" },
          { label: "Computer Teacher (1)", value: "COMPUTER TEACHER" },
          { label: "Office & Support Staff (1)", value: "OFFICE & SUPPORT STAFF" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === tab.value
                ? "bg-school-blue-deep text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter size={12} className={selectedCategory === tab.value ? "text-school-gold" : "text-slate-400"} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl p-6 h-64 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeachers.map((teacher, idx) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className={`rounded-3xl p-6 glass-panel border bg-white/80 shadow-md hover:shadow-xl transition flex flex-col justify-between relative group ${
                teacher.designation === "HEAD MASTER" ? "border-school-gold/50 ring-2 ring-school-gold/20" : "border-slate-100"
              }`}
            >
              <div>
                {/* Header Profile & Photo Slot */}
                <div className="flex gap-4 items-center mb-5">
                  <div className="relative group/photo flex-shrink-0">
                    {teacher.imageUrl ? (
                      <img
                        src={teacher.imageUrl}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-school-gold/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-0.5 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                        <GraduationCap size={22} className="text-school-blue/60" />
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Photo Slot</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-sm md:text-base leading-tight uppercase tracking-tight truncate">
                      {teacher.name}
                    </h3>
                    <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${getDesignationBadgeColor(teacher.designation)}`}>
                      {teacher.designation}
                    </span>
                  </div>
                </div>

                {/* Info Details */}
                <div className="text-xs text-slate-600 flex flex-col gap-2 font-medium border-t border-slate-100 pt-4">
                  {teacher.qualification ? (
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">Qualification:</span>
                      <span className="text-slate-600 font-semibold">{teacher.qualification}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-slate-800 flex-shrink-0">Subject / Role:</span>
                    <span className="text-slate-600 text-right font-medium">{teacher.subjects}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Photo Status */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                  {teacher.imageUrl ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <UserCheck size={12} /> Photo Attached
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Camera size={12} /> No Photo Uploaded
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
