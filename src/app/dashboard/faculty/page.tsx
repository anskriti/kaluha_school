"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut, useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, FileText, Bell, Calendar, Award, 
  CheckSquare, FolderOpen, Video, User, Settings, LogOut, 
  Upload, Trash2, Edit3, Plus, Search, FileDown, Eye, AlertCircle,
  Crop, Sparkles, Sliders, RefreshCw, Moon, Sun, Check, ArrowRight,
  Info, Printer, ChevronRight, X, ArrowUp, ArrowDown
} from "lucide-react";
import * as XLSX from "xlsx";

export default function FacultyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // System Theme
  const [darkMode, setDarkMode] = useState(false);

  // Core Data Lists
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states / CRUD Modal triggers
  const [modalType, setModalType] = useState<string | null>(null); // 'homework' | 'assignment' | 'notice' | 'routine' | 'video' | 'result'
  const [editItem, setEditItem] = useState<any | null>(null);

  // Common Form Fields
  const [targetClass, setTargetClass] = useState("V");
  const [targetSubject, setTargetSubject] = useState("Bengali");
  const [titleText, setTitleText] = useState("");
  const [descText, setDescText] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlField, setUrlField] = useState("");

  // Notice Specific Fields
  const [noticeCategory, setNoticeCategory] = useState("General");
  const [publishSchedule, setPublishSchedule] = useState("");
  const [noticeStatus, setNoticeStatus] = useState("Published");

  // Notice Type Specific Fields (structured JSON data)
  const [examTable, setExamTable] = useState<any[]>([
    { subject: "", examDate: "", day: "", time: "", fullMarks: "", room: "" }
  ]);
  const [noticeTimetable, setNoticeTimetable] = useState<any>({
    Monday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
    Tuesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
    Wednesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
    Thursday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
    Friday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
    Saturday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" }))
  });
  // Active day for the class routine editor (notice)
  const [activeTimetableDay, setActiveTimetableDay] = useState<string>("Monday");
  // Preview Notice Modal state
  const [previewNoticeItem, setPreviewNoticeItem] = useState<any | null>(null);

  // Routine Specific Fields
  const [routineType, setRoutineType] = useState("CLASS");
  const [routineStatus, setRoutineStatus] = useState("PUBLISHED");
  const [gridSchedule, setGridSchedule] = useState<any>({
    Monday: ["", "", "", "", "", "", "", ""],
    Tuesday: ["", "", "", "", "", "", "", ""],
    Wednesday: ["", "", "", "", "", "", "", ""],
    Thursday: ["", "", "", "", "", "", "", ""],
    Friday: ["", "", "", "", "", "", "", ""],
    Saturday: ["", "", "", "", "", "", "", ""]
  });

  // Result Specific Fields
  const [studentSearch, setStudentSearch] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [studentNameField, setStudentNameField] = useState("");
  const [examType, setExamType] = useState("First Unit Test");
  const [subjectMarks, setSubjectMarks] = useState<any>({});

  // Attendance Specific Fields
  const [attendanceClass, setAttendanceClass] = useState("V");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Profile Photo Management states
  const [teacherProfile, setTeacherProfile] = useState<any | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [imageSizeBefore, setImageSizeBefore] = useState<number>(0);
  const [imageSizeAfter, setImageSizeAfter] = useState<number>(0);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Subject configurations
  const subjectsV_VIII = [
    "Bengali", "English", "Mathematics", "History", "Geography", 
    "Physical Science", "Life Science", "EVS", "Work Education", "Physical Education"
  ];

  const subjectsIX_X = [
    "Bengali", "English", "Mathematics", "Physical Science", "Life Science", 
    "History", "Geography", "Computer Application", "Physical Education", "Work Education"
  ];

  const getSubjectsForClass = (cls: string) => {
    return (cls === "IX" || cls === "X") ? subjectsIX_X : subjectsV_VIII;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "FACULTY") {
      router.push("/login?error=Unauthorized");
    }
  }, [status, session, router]);

  // Fetch initial data
  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const { refreshSession } = useAuth();

  // Contact update form states
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contactFeedback, setContactFeedback] = useState("");

  // Initialize contact fields when session is loaded
  useEffect(() => {
    if (session?.user) {
      setEditEmail(session.user.email || "");
      setEditPhone(session.user.phone || session.user.mobile || "");
    }
  }, [session]);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail) {
      setContactStatus("error");
      setContactFeedback("Email cannot be empty.");
      return;
    }

    setContactStatus("loading");
    setContactFeedback("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editEmail, phone: editPhone })
      }).then(r => r.json());

      if (res.success) {
        setContactStatus("success");
        setContactFeedback("Contact info updated successfully!");
        fetchData();
        if (refreshSession) refreshSession();
      } else {
        setContactStatus("error");
        setContactFeedback(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setContactStatus("error");
      setContactFeedback(err.message || "An error occurred.");
    }
  };

  // Load teacher profile when teachers list or session changes
  useEffect(() => {
    if (session?.user && teachers.length > 0) {
      const match = teachers.find(
        (t) => 
          (session.user.directory_record && t.id === session.user.directory_record) ||
          (t.email && t.email.toLowerCase().trim() === session.user.email?.toLowerCase().trim())
      );
      if (match) {
        setTeacherProfile(match);
        setPhotoPreview(match.imageUrl || null);
      }
    }
  }, [teachers, session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        resHomework, resAssign, resNotice, resRoutine, resResult, 
        resMaterial, resVideo, resStudents, resTeachers
      ] = await Promise.all([
        fetch("/api/homework").then(r => r.json()),
        fetch("/api/assignments").then(r => r.json()),
        fetch("/api/notices").then(r => r.json()),
        fetch("/api/routines").then(r => r.json()),
        fetch("/api/results").then(r => r.json()),
        fetch("/api/materials").then(r => r.json()),
        fetch("/api/videos").then(r => r.json()),
        fetch("/api/admin/students").then(r => r.json()),
        fetch("/api/teachers").then(r => r.json())
      ]);

      if (resHomework.success) setHomeworks(resHomework.data || []);
      if (resAssign.success) setAssignments(resAssign.data || []);
      if (resNotice.success) setNotices(resNotice.data || []);
      if (resRoutine.success) setRoutines(resRoutine.data || []);
      if (resResult.success) setResults(resResult.data || []);
      if (resMaterial.success) {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
        const formatted = (resMaterial.data || []).map((r: any) => ({
          ...r,
          fileUrl: r.fileUrl ? `${pbUrl}/api/files/study_materials/${r.id}/${r.fileUrl}` : ""
        }));
        setMaterials(formatted);
      }
      if (resVideo.success) setVideos(resVideo.data || []);
      if (resStudents.success) setStudents(resStudents.data || []);
      if (resTeachers.success) setTeachers(resTeachers.data || []);

    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to load attendance records for selected class & date
  const loadAttendance = async (cls: string, dt: string) => {
    try {
      const res = await fetch(`/api/attendance?className=${cls}&date=${dt}`).then(r => r.json());
      if (res.success && res.data.length > 0) {
        setAttendanceRecords(res.data);
      } else {
        // Fallback: Map from students list
        const classStudents = students.filter(s => s.className === cls || s.className?.replace(/^Class\s+/i, "") === cls);
        const mapped = classStudents.map(s => ({
          studentId: s.username || s.id,
          studentName: s.name,
          status: "PRESENT"
        }));
        setAttendanceRecords(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance" && students.length > 0) {
      loadAttendance(attendanceClass, attendanceDate);
    }
  }, [activeTab, attendanceClass, attendanceDate, students]);

  // Attendance Save handler
  const saveAttendance = async () => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          className: attendanceClass,
          records: attendanceRecords
        })
      }).then(r => r.json());

      if (res.success) {
        alert("Attendance records saved successfully!");
      } else {
        alert("Error saving attendance: " + res.error);
      }
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    }
  };

  // Profile Photo Upload / Crop / Compress Helper
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageSizeBefore(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOriginalPhoto(event.target.result as string);
        setPhotoPreview(event.target.result as string);
        setIsCropping(true);
        setZoomScale(1);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyCropAndCompression = () => {
    if (!canvasRef.current || !cropImageRef.current) return;

    const canvas = canvasRef.current;
    const img = cropImageRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Output square dimensions
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Simple zoom/centering calculation on canvas
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const sWidth = size / zoomScale;
    const sHeight = size / zoomScale;
    const sx = (img.naturalWidth - sWidth) / 2;
    const sy = (img.naturalHeight - sHeight) / 2;

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);

    // Export as JPEG with quality 0.6 (Automatic Compression)
    const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
    
    // Estimate size
    const head = "data:image/jpeg;base64,";
    const sizeBytes = Math.round((compressedDataUrl.length - head.length)* 3/4);
    setImageSizeAfter(Math.round(sizeBytes / 1024));
    
    setCroppedPhoto(compressedDataUrl);
    setPhotoPreview(compressedDataUrl);
    setIsCropping(false);
  };

  const saveProfilePhoto = async () => {
    if (!teacherProfile || !photoPreview) return;
    setUploadingPhoto(true);

    try {
      const res = await fetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: teacherProfile.id,
          imageUrl: photoPreview
        })
      }).then(r => r.json());

      if (res.success) {
        alert("Profile photo updated successfully!");
        setOriginalPhoto(null);
        setCroppedPhoto(null);
        // Refresh local teacher list
        fetchData();
      } else {
        alert("Failed to save: " + res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deleteProfilePhoto = async () => {
    if (!confirm("Are you sure you want to delete your profile photo?")) return;
    setUploadingPhoto(true);

    try {
      const res = await fetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: teacherProfile?.id,
          deletePhoto: true
        })
      }).then(r => r.json());

      if (res.success) {
        alert("Profile photo deleted successfully!");
        setPhotoPreview(null);
        setOriginalPhoto(null);
        setCroppedPhoto(null);
        setImageSizeBefore(0);
        setImageSizeAfter(0);
        fetchData();
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Password Change Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("error");
      setPasswordFeedback("Please fill out all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus("error");
      setPasswordFeedback("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordFeedback("New passwords do not match.");
      return;
    }

    setPasswordStatus("loading");
    setPasswordFeedback("");

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      }).then(r => r.json());

      if (res.success) {
        setPasswordStatus("success");
        setPasswordFeedback("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus("error");
        setPasswordFeedback(res.error || "Failed to update password.");
      }
    } catch (e: any) {
      setPasswordStatus("error");
      setPasswordFeedback(e.message || "Failed to connect to API.");
    }
  };

  // Excel Importer Parser
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const parsedRows: any[] = XLSX.utils.sheet_to_json(sheet);

        if (parsedRows.length > 0) {
          const row = parsedRows[0];
          setStudentRoll(row.RollNumber || row.roll || "");
          setStudentNameField(row.StudentName || row.name || "");
          setExamType(row.ExamType || row.exam || "First Unit Test");

          // Map subject marks
          const marksObj: any = {};
          const subjects = getSubjectsForClass(targetClass);
          subjects.forEach(sub => {
            const val = row[sub] || row[sub.toLowerCase()];
            if (val !== undefined) marksObj[sub] = parseInt(val);
          });
          setSubjectMarks(marksObj);
          alert("Excel marks imported successfully!");
        }
      } catch (err: any) {
        alert("Error parsing Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Result save handler
  const saveResult = async () => {
    try {
      const subjects = getSubjectsForClass(targetClass);
      let total = 0;
      subjects.forEach(s => {
        total += parseInt(subjectMarks[s] || 0);
      });
      const percentage = (total / (subjects.length * 100)) * 100;
      const status = percentage >= 35 ? "PASSED" : "FAILED";

      const payload: any = {
        studentName: studentNameField,
        rollNumber: studentRoll,
        className: targetClass,
        examType,
        totalMarks: total,
        percentage,
        status,
        subjectMarks: JSON.stringify(subjectMarks)
      };

      let url = "/api/results";
      let method = "POST";
      if (editItem) {
        payload.id = editItem.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        alert("Result saved successfully!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      } else {
        alert("Error saving: " + res.error);
      }
    } catch (e: any) {
      alert("Failed: " + e.message);
    }
  };

  // Routine publish helper
  const saveRoutine = async () => {
    try {
      const formData = new FormData();
      if (editItem) formData.append("id", editItem.id);
      formData.append("className", targetClass);
      formData.append("type", routineType);
      formData.append("title", titleText);
      formData.append("status", routineStatus);
      formData.append("schedule", JSON.stringify(gridSchedule));
      if (selectedFile) formData.append("pdfUrl", selectedFile);

      const res = await fetch("/api/routines", {
        method: "POST",
        body: formData
      }).then(r => r.json());

      if (res.success) {
        alert("Routine published successfully!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      } else {
        alert("Error publishing routine: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Notice save helper
  const saveNotice = async () => {
    try {
      const formData = new FormData();
      if (editItem) formData.append("id", editItem.id);
      formData.append("title", titleText);
      formData.append("category", noticeCategory);
      
      // Determine content based on notice type
      let finalContent = descText;
      if (noticeCategory === "Examination Notice") {
        finalContent = JSON.stringify(examTable);
      } else if (noticeCategory === "Class Routine") {
        finalContent = JSON.stringify(noticeTimetable);
      }
      
      formData.append("content", finalContent);
      formData.append("status", noticeStatus);
      formData.append("publishDate", publishSchedule || new Date().toISOString());
      if (selectedFile) formData.append("pdfUrl", selectedFile);

      // Create / Edit
      const url = editItem ? `/api/notices?id=${editItem.id}` : "/api/notices";
      // We will parse standard post
      const res = await fetch("/api/notices", {
        method: "POST",
        body: formData
      }).then(r => r.json());

      if (res.success) {
        alert("Notice saved successfully!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      } else {
        alert("Error saving notice: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Homework save helper
  const saveHomework = async () => {
    try {
      const payload = {
        className: targetClass,
        subject: targetSubject,
        title: titleText,
        instruction: descText,
        deadline: deadlineDate
      };
      const method = editItem ? "PUT" : "POST";
      const res = await fetch("/api/homework", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem ? { ...payload, id: editItem.id } : payload)
      }).then(r => r.json());

      if (res.success) {
        alert("Homework saved!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Assignment save helper
  const saveAssignment = async () => {
    try {
      const payload = {
        className: targetClass,
        subject: targetSubject,
        title: titleText,
        instruction: descText,
        deadline: deadlineDate
      };
      const method = editItem ? "PUT" : "POST";
      const res = await fetch("/api/assignments", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem ? { ...payload, id: editItem.id } : payload)
      }).then(r => r.json());

      if (res.success) {
        alert("Assignment saved!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Study Material save helper
  const saveMaterial = async () => {
    try {
      const formData = new FormData();
      if (editItem) formData.append("id", editItem.id);
      formData.append("className", targetClass);
      formData.append("subject", targetSubject);
      formData.append("title", titleText);
      formData.append("description", descText);
      if (selectedFile) formData.append("fileUrl", selectedFile);

      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData
      }).then(r => r.json());

      if (res.success) {
        alert("Study material saved!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      } else {
        alert("Error saving study material: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Video Tutorial save helper
  const saveVideo = async () => {
    try {
      const formData = new FormData();
      if (editItem) formData.append("id", editItem.id);
      formData.append("className", targetClass);
      formData.append("subject", targetSubject);
      formData.append("title", titleText);
      formData.append("description", descText);
      formData.append("videoUrl", urlField);
      if (selectedFile) formData.append("pdfUrl", selectedFile);

      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData
      }).then(r => r.json());

      if (res.success) {
        alert("Video tutorial saved!");
        setModalType(null);
        setEditItem(null);
        fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Generic Delete handler
  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/${type}?id=${id}`, { method: "DELETE" }).then(r => r.json());
      if (res.success) {
        alert("Deleted successfully!");
        fetchData();
      } else {
        alert("Error: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Triggers for modals
  const triggerEdit = (type: string, item: any) => {
    let normType = type;
    if (type === "assignments") normType = "assignment";
    if (type === "videos") normType = "video";

    setEditItem(item);
    setTargetClass(item.className || "V");
    setTargetSubject(item.subject || "Bengali");
    setTitleText(item.title || "");
    setDescText(item.instruction || item.content || item.description || "");
    setDeadlineDate(item.deadline ? item.deadline.split("T")[0] : "");
    setUrlField(item.videoUrl || "");
    setModalType(normType);

    if (type === "notice") {
      setNoticeCategory(item.category || "General Notice");
      setNoticeStatus(item.status || "Published");
      setPublishSchedule(item.publishDate ? item.publishDate.split("T")[0] : "");
      
      // Load structured content based on notice type
      if (item.category === "Examination Notice") {
        try {
          setExamTable(JSON.parse(item.content));
        } catch (_) {
          setExamTable([{ subject: "", examDate: "", day: "", time: "", fullMarks: "", room: "" }]);
        }
      } else if (item.category === "Class Routine") {
        try {
          setNoticeTimetable(JSON.parse(item.content));
        } catch (_) {
          setNoticeTimetable({
            Monday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
            Tuesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
            Wednesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
            Thursday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
            Friday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
            Saturday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" }))
          });
        }
      } else {
        setDescText(item.content || "");
      }
    }

    if (type === "routine") {
      setRoutineType(item.type || "CLASS");
      setRoutineStatus(item.status || "PUBLISHED");
      try {
        setGridSchedule(JSON.parse(item.schedule));
      } catch (_) {}
    }

    if (type === "result") {
      setStudentRoll(item.rollNumber || "");
      setStudentNameField(item.studentName || "");
      setExamType(item.examType || "First Unit Test");
      try {
        setSubjectMarks(JSON.parse(item.subjectMarks || "{}"));
      } catch (_) {}
    }
  };

  const triggerCreate = (type: string) => {
    let normType = type;
    if (type === "assignments") normType = "assignment";
    if (type === "videos") normType = "video";

    setEditItem(null);
    setTitleText("");
    setDescText("");
    setDeadlineDate("");
    setUrlField("");
    setSelectedFile(null);
    setModalType(normType);

    if (type === "notice") {
      setNoticeCategory("General Notice");
      setNoticeStatus("Published");
      setPublishSchedule("");
      setDescText("");
      setExamTable([{ subject: "", examDate: "", day: "", time: "", fullMarks: "", room: "" }]);
      setNoticeTimetable({
        Monday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
        Tuesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
        Wednesday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
        Thursday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
        Friday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" })),
        Saturday: Array(8).fill(null).map(() => ({ subject: "", teacher: "" }))
      });
      setActiveTimetableDay("Monday");
    }

    if (type === "routine") {
      setRoutineType("CLASS");
      setRoutineStatus("PUBLISHED");
      setGridSchedule({
        Monday: ["", "", "", "", "", "", "", ""],
        Tuesday: ["", "", "", "", "", "", "", ""],
        Wednesday: ["", "", "", "", "", "", "", ""],
        Thursday: ["", "", "", "", "", "", "", ""],
        Friday: ["", "", "", "", "", "", "", ""],
        Saturday: ["", "", "", "", "", "", "", ""]
      });
    }

    if (type === "result") {
      setStudentRoll("");
      setStudentNameField("");
      setExamType("First Unit Test");
      setSubjectMarks({});
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="animate-spin text-school-blue w-8 h-8" />
      </div>
    );
  }

  // Sidebar link details
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "homework", label: "Homework Manager", icon: BookOpen },
    { id: "assignments", label: "Assignment Manager", icon: CheckSquare },
    { id: "notices", label: "Notice Manager", icon: Bell },
    { id: "routines", label: "Routine Manager", icon: Calendar },
    { id: "results", label: "Result Manager", icon: Award },
    { id: "attendance", label: "Attendance Manager", icon: CheckSquare },
    { id: "materials", label: "Study Material Manager", icon: FolderOpen },
    { id: "videos", label: "Video Tutorial Manager", icon: Video },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-full md:w-64 border-r p-5 flex flex-col justify-between shrink-0 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col gap-6">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-school-blue flex items-center justify-center text-white font-bold shadow-md shadow-school-blue/20">
              KJ
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight leading-none uppercase">KJHS</h2>
              <span className="text-[10px] font-bold text-school-gold tracking-widest uppercase">ERP Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-school-blue text-white shadow-lg shadow-school-blue/20" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 relative overflow-hidden">
              {teacherProfile?.imageUrl ? (
                <img src={teacherProfile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                session?.user?.username?.substring(0, 2).toUpperCase() || "F"
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black truncate">{teacherProfile?.name || session?.user?.username}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Member</span>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className={`p-4 border-b flex justify-between items-center ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200"}`}>
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-slate-400">
            Workspace / {activeTab.replace("-", " ")}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD MODULE */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Welcome, {teacherProfile?.name || "Educator"}!</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Here is your digital classroom operations dashboard.</p>
                </div>

                {/* Metrics Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homeworks Logged</span>
                      <h3 className="text-2xl font-black mt-1">{homeworks.length}</h3>
                    </div>
                    <div className="p-3 bg-school-blue/10 text-school-blue rounded-2xl"><BookOpen size={20} /></div>
                  </div>
                  
                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Assignments</span>
                      <h3 className="text-2xl font-black mt-1">{assignments.length}</h3>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><CheckSquare size={20} /></div>
                  </div>

                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notice Bulletins</span>
                      <h3 className="text-2xl font-black mt-1">{notices.length}</h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Bell size={20} /></div>
                  </div>

                  <div className={`p-6 border rounded-3xl shadow-sm flex items-center justify-between ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Classes</span>
                      <h3 className="text-2xl font-black mt-1">{videos.length}</h3>
                    </div>
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><Video size={20} /></div>
                  </div>
                </div>

                {/* Quick operations */}
                <div className={`p-6 border rounded-3xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4">Quick Operations Panel</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveTab("homework")} className="px-4 py-2 bg-school-blue text-white text-xs font-bold uppercase rounded-xl hover:shadow-lg hover:shadow-school-blue/20 transition cursor-pointer">Post Homework</button>
                    <button onClick={() => setActiveTab("attendance")} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-xl hover:shadow-lg hover:shadow-indigo-600/20 transition cursor-pointer">Mark Attendance</button>
                    <button onClick={() => setActiveTab("results")} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl hover:shadow-lg hover:shadow-emerald-600/20 transition cursor-pointer">Publish Grades</button>
                    <button onClick={() => setActiveTab("notices")} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold uppercase rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition cursor-pointer">Publish Notice</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE PHOTO & REGISTER LOG MODULE */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-4xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">My Teacher Profile</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Official registry details (Read-only) and profile photo updater.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Photo Section */}
                  <div className={`p-6 border rounded-3xl flex flex-col items-center gap-5 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    
                    <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-800 relative bg-slate-100 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" ref={cropImageRef} />
                      ) : (
                        <User size={60} className="text-slate-300" />
                      )}
                    </div>

                    {isCropping && (
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Crop Zoom & Preview</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="0.1" 
                          value={zoomScale} 
                          onChange={(e) => setZoomScale(parseFloat(e.target.value))} 
                          className="w-full" 
                        />
                        <button 
                          onClick={applyCropAndCompression}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer"
                        >
                          Crop & Compress
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 w-full text-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handlePhotoSelect} 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 border border-dashed border-slate-350 text-slate-650 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase rounded-xl tracking-wider transition cursor-pointer"
                      >
                        {photoPreview ? "Replace Photo" : "Upload Photo"}
                      </button>

                      {photoPreview && (
                        <button
                          onClick={deleteProfilePhoto}
                          disabled={uploadingPhoto}
                          className="w-full py-2.5 border border-red-200 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs uppercase rounded-xl tracking-wider transition cursor-pointer"
                        >
                          Delete Photo
                        </button>
                      )}

                      {photoPreview && (originalPhoto || croppedPhoto) && (
                        <button
                          onClick={saveProfilePhoto}
                          disabled={uploadingPhoto}
                          className="w-full py-2.5 bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs uppercase rounded-xl tracking-wider shadow transition disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingPhoto ? "Saving..." : "Save Profile Photo"}
                        </button>
                      )}
                    </div>

                    {/* Compression Statistics widget */}
                    {imageSizeBefore > 0 && imageSizeAfter > 0 && (
                      <div className="w-full p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-[10px] font-medium text-emerald-800 dark:text-emerald-300 flex flex-col gap-1">
                        <div>Original Size: <span className="font-extrabold">{imageSizeBefore} KB</span></div>
                        <div>Compressed Size: <span className="font-extrabold">{imageSizeAfter} KB</span></div>
                        <div className="text-[9px] text-emerald-500 font-black">Automatic reduction: {Math.round((1 - imageSizeAfter/imageSizeBefore)*100)}%</div>
                      </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Profile Metadata Registry Cards */}
                  <div className={`lg:col-span-2 p-6 border rounded-3xl shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div className="flex justify-between items-center border-b pb-4 mb-5">
                      <h3 className="font-black text-sm uppercase tracking-wider">Teacher Registry Profile</h3>
                      <span className="text-[9px] bg-red-650/10 text-red-600 font-extrabold px-2.5 py-0.5 rounded border border-red-500/20 uppercase tracking-widest flex items-center gap-1"><Info size={11} /> Read Only Profile</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Official Name</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.name || "Not Seeded"}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Official Designation</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.designation || "Not Seeded"}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Assigned Subjects</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.subjects || "Not Seeded"}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Academic Qualification</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.qualification || "N/A"}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registered Email</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.email || session?.user?.email}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registered Mobile</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">{teacherProfile?.phone || "N/A"}</div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Official Registry ID</span>
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold text-school-blue dark:text-school-gold-light">{teacherProfile?.id || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ATTENDANCE MODULE */}
            {activeTab === "attendance" && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Attendance Logger</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Mark daily roll records and review class reports.</p>
                  </div>
                  <button 
                    onClick={saveAttendance}
                    className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save Daily Logs</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Class Name</span>
                    <select 
                      value={attendanceClass} 
                      onChange={(e) => setAttendanceClass(e.target.value)} 
                      className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                    >
                      {["V", "VI", "VII", "VIII", "IX", "X"].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Date</span>
                    <input 
                      type="date" 
                      value={attendanceDate} 
                      onChange={(e) => setAttendanceDate(e.target.value)} 
                      className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Attendance grid */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <table className="min-w-full text-xs text-left text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-850 text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-850">
                      <tr>
                        <th className="px-5 py-3">Student Name</th>
                        <th className="px-5 py-3">Roll/Username</th>
                        <th className="px-5 py-3 text-right">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold">
                      {attendanceRecords.map((item, idx) => (
                        <tr key={item.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition">
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">{item.studentName}</td>
                          <td className="px-5 py-3.5 text-slate-400">{item.studentId}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {["PRESENT", "ABSENT", "LATE", "LEAVE"].map((status) => {
                                const active = item.status === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      const updated = [...attendanceRecords];
                                      updated[idx].status = status;
                                      setAttendanceRecords(updated);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition border cursor-pointer ${
                                      active
                                        ? status === "PRESENT"
                                          ? "bg-emerald-655 text-emerald-800 border-emerald-400 bg-emerald-100"
                                          : status === "ABSENT"
                                          ? "bg-red-655 text-red-800 border-red-400 bg-red-100"
                                          : status === "LATE"
                                          ? "bg-amber-655 text-amber-800 border-amber-400 bg-amber-100"
                                          : "bg-blue-655 text-blue-800 border-blue-400 bg-blue-100"
                                        : "bg-transparent text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {attendanceRecords.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-slate-400 py-12 font-medium">No student registry records found in this class.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB: RESULT MANAGER MODULE */}
            {activeTab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Result Manager</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Upload grade cards, import spreadsheet files, and manage statements.</p>
                  </div>
                  <button 
                    onClick={() => triggerCreate("result")}
                    className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Upload Student Marksheet</span>
                  </button>
                </div>

                {/* Display reports list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {results.map(r => (
                    <div key={r.id} className={`p-5 border rounded-3xl shadow-sm flex flex-col gap-3 relative ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-school-blue/10 text-school-blue font-extrabold px-2.5 py-0.5 rounded border border-school-blue/20 uppercase tracking-widest">{r.examType}</span>
                          <h3 className="font-black text-sm uppercase mt-2">{r.studentName}</h3>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Roll: {r.rollNumber} • Class: {r.className}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => triggerEdit("result", r)} className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"><Edit3 size={13} /></button>
                          <button onClick={() => handleDelete("results", r.id)} className="p-2 border rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-end border-t pt-3 mt-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Marks summary</div>
                        <div className="text-right">
                          <span className="text-xs font-black block text-slate-900 dark:text-slate-100">{r.totalMarks} Marks</span>
                          <span className="text-[9px] font-extrabold text-school-gold uppercase tracking-wider">{r.percentage.toFixed(1)}% ({r.status})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.length === 0 && (
                    <div className="md:col-span-2 text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl">No student marksheets uploaded yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: ROUTINE MANAGER */}
            {activeTab === "routines" && (
              <motion.div
                key="routines"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Routine Manager</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Publish Class Timetables and Examination Routines.</p>
                  </div>
                  <button 
                    onClick={() => triggerCreate("routine")}
                    className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Publish Routine</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {routines.map(rt => (
                    <div key={rt.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-4 relative ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-widest ${
                            rt.type === "EXAM" ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-755 border-indigo-200"
                          }`}>{rt.type} ROUTINE</span>
                          <h3 className="font-black text-sm uppercase mt-2">{rt.title}</h3>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Target: Class {rt.className}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => triggerEdit("routine", rt)} className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"><Edit3 size={13} /></button>
                          <button onClick={() => handleDelete("routines", rt.id)} className="p-2 border rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3 mt-1 text-[10px] font-bold uppercase text-slate-400">
                        <span>Status: <span className={rt.status === "PUBLISHED" ? "text-emerald-600" : "text-amber-500"}>{rt.status}</span></span>
                        {rt.pdfUrl && <span className="text-school-blue flex items-center gap-1"><FileDown size={12} /> PDF Attached</span>}
                      </div>
                    </div>
                  ))}
                  {routines.length === 0 && (
                    <div className="md:col-span-2 text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl">No routines published yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: NOTICE MANAGER */}
            {activeTab === "notices" && (
              <motion.div
                key="notices"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Notice Manager</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Create notice bulletins, schedule publications, and archive announcements.</p>
                  </div>
                  <button 
                    onClick={() => triggerCreate("notice")}
                    className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Create Notice</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {notices.map(nt => (
                    <div key={nt.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-3 relative ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded border border-amber-200 uppercase tracking-widest">{nt.category}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                              nt.status === "Published" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"
                            }`}>{nt.status}</span>
                          </div>
                          <h3 className="font-black text-sm uppercase mt-2.5">{nt.title}</h3>
                          <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                            {nt.category === "Examination Notice" 
                              ? "[Examination Timetable]" 
                              : nt.category === "Class Routine" 
                                ? "[Class Timetable]" 
                                : nt.content}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPreviewNoticeItem(nt)} 
                            className="p-2 border rounded-lg text-school-blue hover:bg-school-blue/5 cursor-pointer"
                            title="Preview Notice"
                          >
                            <Eye size={13} />
                          </button>
                          <button onClick={() => triggerEdit("notice", nt)} className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"><Edit3 size={13} /></button>
                          <button onClick={() => handleDelete("notices", nt.id)} className="p-2 border rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <div className="border-t pt-3 mt-1.5 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span>Publish date: {nt.publishDate ? new Date(nt.publishDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                        {nt.pdfUrl && <span className="text-school-blue flex items-center gap-1"><FileDown size={11} /> PDF Attached</span>}
                      </div>
                    </div>
                  ))}
                  {notices.length === 0 && (
                    <div className="text-center text-slate-400 py-16 font-medium border border-dashed rounded-3xl">No notices posted yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FALLBACK TABS FOR EXISTING CRUD MODULES */}
            {["homework", "assignments", "materials", "videos"].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8"
              >
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage, upload, edit, or delete items in this workspace.</p>
                  </div>
                  <button 
                    onClick={() => triggerCreate(activeTab)}
                    className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Upload New</span>
                  </button>
                </div>

                {/* Display listing grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {((activeTab === "homework" ? homeworks : activeTab === "assignments" ? assignments : activeTab === "materials" ? materials : videos)).map((item) => (
                    <div key={item.id} className={`p-6 border rounded-3xl flex flex-col justify-between gap-4 relative ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-school-blue/10 text-school-blue font-extrabold px-2.5 py-0.5 rounded border border-school-blue/20 uppercase tracking-widest">{item.subject}</span>
                            <h3 className="font-black text-sm uppercase mt-2.5">{item.title}</h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Class {item.className}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => triggerEdit(activeTab, item)} className="p-2 border rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete(activeTab === "homework" ? "homework" : activeTab, item.id)} className="p-2 border rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        {item.instruction && <p className="text-slate-500 text-xs mt-3">{item.instruction}</p>}
                        {item.description && <p className="text-slate-500 text-xs mt-3">{item.description}</p>}
                      </div>
                      <div className="border-t pt-3 mt-1 flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase">
                        {item.deadline && <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
                        {item.videoUrl && <span className="truncate max-w-[200px] text-school-blue font-semibold">{item.videoUrl}</span>}
                        {item.fileUrl && (
                          <a 
                            href={item.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-school-blue hover:text-school-blue-deep flex items-center gap-1 font-extrabold cursor-pointer"
                          >
                            <FileDown size={11} /> Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS MODULE */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-8 max-w-xl"
              >
                <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Portal Settings</h1>
                  <p className="text-slate-400 text-sm font-medium mt-1">Configure portal themes and dashboard layout configurations.</p>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-6 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Appearance Configurations</h3>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold block">Portal Theme Mode</span>
                      <span className="text-slate-400 text-[10px] mt-0.5">Toggle between light and dark theme mode.</span>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-14 h-7 rounded-full transition relative flex items-center px-1 cursor-pointer ${
                        darkMode ? "bg-school-blue" : "bg-slate-200"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${darkMode ? "translate-x-7" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-5 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Update Contact Information</h3>
                  <form onSubmit={handleUpdateContact} className="flex flex-col gap-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registered Email</label>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter new email"
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Registered Phone Number</label>
                      <input 
                        type="text" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      />
                    </div>

                    {contactStatus === "success" && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-955/25 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold">
                        {contactFeedback}
                      </div>
                    )}
                    {contactStatus === "error" && (
                      <div className="p-3 bg-red-50 dark:bg-red-955/25 border border-red-200 text-red-800 dark:text-red-300 rounded-xl font-bold">
                        {contactFeedback}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={contactStatus === "loading"}
                      className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                    >
                      {contactStatus === "loading" ? "Updating..." : "Update Contact Info"}
                    </button>
                  </form>
                </div>

                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-5 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Change Portal Password</h3>
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      />
                    </div>

                    {passwordStatus === "success" && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-955/25 border border-emerald-200 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold">
                        {passwordFeedback}
                      </div>
                    )}
                    {passwordStatus === "error" && (
                      <div className="p-3 bg-red-50 dark:bg-red-955/25 border border-red-200 text-red-800 dark:text-red-300 rounded-xl font-bold">
                        {passwordFeedback}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={passwordStatus === "loading"}
                      className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                    >
                      {passwordStatus === "loading" ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ================================================= */}
      {/* GLOBAL MODALS CRUD BULK LOGGERS */}
      {/* ================================================= */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border overflow-y-auto max-h-[90vh] ${
                darkMode ? "bg-slate-900 border-slate-800 text-slate-150" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <button 
                onClick={() => setModalType(null)} 
                className="absolute top-5 right-5 w-8 h-8 rounded-full border flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X size={15} />
              </button>

              <h2 className="font-black text-lg uppercase tracking-tight mb-6">
                {editItem ? "Edit" : "Create"} {modalType.toUpperCase()}
              </h2>

              <div className="flex flex-col gap-4 text-xs font-semibold">
                
                {/* Standard Inputs: Class Selector */}
                {["homework", "assignment", "routine", "video", "result", "materials"].includes(modalType) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Class Target</label>
                    <select 
                      value={targetClass} 
                      onChange={(e) => setTargetClass(e.target.value)} 
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                    >
                      {["V", "VI", "VII", "VIII", "IX", "X"].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                )}

                {/* Standard Inputs: Subject Selector */}
                {["homework", "assignment", "video", "materials"].includes(modalType) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Subject Name</label>
                    <select 
                      value={targetSubject} 
                      onChange={(e) => setTargetSubject(e.target.value)} 
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                    >
                      {getSubjectsForClass(targetClass).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Title / Header */}
                {["homework", "assignment", "routine", "video", "notice", "materials"].includes(modalType) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Title / Caption</label>
                    <input 
                      type="text" 
                      value={titleText} 
                      onChange={(e) => setTitleText(e.target.value)} 
                      placeholder="Enter title text..."
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                    />
                  </div>
                )}

                {/* Content Details / Text */}
                {((["homework", "assignment", "video", "materials"].includes(modalType)) ||
                  (modalType === "notice" && !["Examination Notice", "Class Routine"].includes(noticeCategory))) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Instructions / Description</label>
                    <textarea 
                      rows={4}
                      value={descText} 
                      onChange={(e) => setDescText(e.target.value)} 
                      placeholder="Provide descriptive details here..."
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                    />
                  </div>
                )}

                {/* Deadline */}
                {["homework", "assignment"].includes(modalType) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Submission Deadline</label>
                    <input 
                      type="date" 
                      value={deadlineDate} 
                      onChange={(e) => setDeadlineDate(e.target.value)} 
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                    />
                  </div>
                )}



                {/* Notice Category */}
                {modalType === "notice" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Notice Type</label>
                      <select 
                        value={noticeCategory} 
                        onChange={(e) => setNoticeCategory(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      >
                        {[
                          "General Notice",
                          "Examination Notice",
                          "Class Routine",
                          "Holiday Notice",
                          "Admission Notice",
                          "Result Notice",
                          "Circular"
                        ].map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Publication Status</label>
                      <select 
                        value={noticeStatus} 
                        onChange={(e) => setNoticeStatus(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      >
                        {["Draft", "Published", "Archived"].map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Publish Schedule Publish Date (Optional)</label>
                      <input 
                        type="date" 
                        value={publishSchedule} 
                        onChange={(e) => setPublishSchedule(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                      />
                    </div>

                    {/* Dynamic Editor: Examination Notice Table */}
                    {noticeCategory === "Examination Notice" && (
                      <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-[10px] uppercase text-slate-400 font-black">Examination Timetable</span>
                          <button 
                            type="button"
                            onClick={() => setExamTable([...examTable, { subject: "", examDate: "", day: "", time: "", fullMarks: "", room: "" }])}
                            className="bg-school-blue hover:bg-school-blue-deep text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition"
                          >
                            <Plus size={10} /> Add Row
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                          {examTable.map((row, idx) => (
                            <div key={idx} className="p-3 border rounded-xl bg-white dark:bg-slate-900 flex flex-col gap-2 relative">
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                                <span>Row {idx + 1}</span>
                                <div className="flex gap-1.5">
                                  <button 
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const updated = [...examTable];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx - 1];
                                      updated[idx - 1] = temp;
                                      setExamTable(updated);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button 
                                    type="button"
                                    disabled={idx === examTable.length - 1}
                                    onClick={() => {
                                      const updated = [...examTable];
                                      const temp = updated[idx];
                                      updated[idx] = updated[idx + 1];
                                      updated[idx + 1] = temp;
                                      setExamTable(updated);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      if (examTable.length > 1) {
                                        setExamTable(examTable.filter((_, i) => i !== idx));
                                      } else {
                                        alert("Must have at least one row.");
                                      }
                                    }}
                                    className="p-1 hover:bg-red-50 text-red-500 rounded"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Subject</label>
                                  <input 
                                    type="text"
                                    value={row.subject}
                                    onChange={(e) => {
                                      const updated = [...examTable];
                                      updated[idx].subject = e.target.value;
                                      setExamTable(updated);
                                    }}
                                    placeholder="e.g. Mathematics"
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Exam Date</label>
                                  <input 
                                    type="date"
                                    value={row.examDate}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = [...examTable];
                                      updated[idx].examDate = val;
                                      if (val) {
                                        try {
                                          const d = new Date(val);
                                          updated[idx].day = d.toLocaleDateString("en-US", { weekday: "long" });
                                        } catch (_) {}
                                      }
                                      setExamTable(updated);
                                    }}
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-955 dark:border-slate-850 text-[10px]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Day of Week</label>
                                  <input 
                                    type="text"
                                    value={row.day}
                                    onChange={(e) => {
                                      const updated = [...examTable];
                                      updated[idx].day = e.target.value;
                                      setExamTable(updated);
                                    }}
                                    placeholder="e.g. Monday"
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Exam Time</label>
                                  <input 
                                    type="text"
                                    value={row.time}
                                    onChange={(e) => {
                                      const updated = [...examTable];
                                      updated[idx].time = e.target.value;
                                      setExamTable(updated);
                                    }}
                                    placeholder="e.g. 10:00 AM - 1:00 PM"
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-[10px]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Full Marks</label>
                                  <input 
                                    type="text"
                                    value={row.fullMarks}
                                    onChange={(e) => {
                                      const updated = [...examTable];
                                      updated[idx].fullMarks = e.target.value;
                                      setExamTable(updated);
                                    }}
                                    placeholder="e.g. 100"
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-955 dark:border-slate-850 text-[10px]"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <label className="text-slate-400 font-bold uppercase text-[9px]">Room (Optional)</label>
                                  <input 
                                    type="text"
                                    value={row.room}
                                    onChange={(e) => {
                                      const updated = [...examTable];
                                      updated[idx].room = e.target.value;
                                      setExamTable(updated);
                                    }}
                                    placeholder="e.g. Room 102"
                                    className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-955 dark:border-slate-850 text-[10px]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Editor: Class Routine Weekly Timetable */}
                    {noticeCategory === "Class Routine" && (
                      <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl">
                        <span className="text-[10px] uppercase text-slate-400 font-black border-b pb-2">Class Timetable Editor</span>
                        
                        <div className="flex flex-wrap gap-1 border-b pb-2">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setActiveTimetableDay(day)}
                              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer ${
                                activeTimetableDay === day 
                                  ? "bg-school-blue text-white shadow-sm" 
                                  : "bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                              }`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 mt-1 text-[10px]">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Editing Periods for {activeTimetableDay}</span>
                          {Array(8).fill(null).map((_, periodIdx) => {
                            const periodRow = (noticeTimetable[activeTimetableDay] || [])[periodIdx] || { subject: "", teacher: "" };
                            return (
                              <div key={periodIdx} className="grid grid-cols-12 gap-2 items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                                <span className="col-span-3 text-[9px] font-black text-slate-400 uppercase">Period {periodIdx + 1}</span>
                                <div className="col-span-5 flex flex-col gap-0.5">
                                  <input 
                                    type="text"
                                    value={periodRow.subject}
                                    onChange={(e) => {
                                      const updated = { ...noticeTimetable };
                                      if (!updated[activeTimetableDay]) {
                                        updated[activeTimetableDay] = Array(8).fill(null).map(() => ({ subject: "", teacher: "" }));
                                      }
                                      updated[activeTimetableDay][periodIdx] = {
                                        ...updated[activeTimetableDay][periodIdx],
                                        subject: e.target.value
                                      };
                                      setNoticeTimetable(updated);
                                    }}
                                    placeholder="Subject"
                                    className="p-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-850 text-[10px]"
                                  />
                                </div>
                                <div className="col-span-4 flex flex-col gap-0.5">
                                  <input 
                                    type="text"
                                    value={periodRow.teacher || ""}
                                    onChange={(e) => {
                                      const updated = { ...noticeTimetable };
                                      if (!updated[activeTimetableDay]) {
                                        updated[activeTimetableDay] = Array(8).fill(null).map(() => ({ subject: "", teacher: "" }));
                                      }
                                      updated[activeTimetableDay][periodIdx] = {
                                        ...updated[activeTimetableDay][periodIdx],
                                        teacher: e.target.value
                                      };
                                      setNoticeTimetable(updated);
                                    }}
                                    placeholder="Teacher"
                                    className="p-1.5 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-850 text-[10px]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Routine specific: type & grid */}
                {modalType === "routine" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Routine Type</label>
                      <select 
                        value={routineType} 
                        onChange={(e) => setRoutineType(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      >
                        <option value="CLASS">Class Routine Grid</option>
                        <option value="EXAM">Examination Timetable</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Status</label>
                      <select 
                        value={routineStatus} 
                        onChange={(e) => setRoutineStatus(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft / Hidden</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Video tutorial specific URL */}
                {modalType === "video" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">YouTube Embed Code / Link</label>
                    <input 
                      type="text" 
                      value={urlField} 
                      onChange={(e) => setUrlField(e.target.value)} 
                      placeholder="e.g. YouTube video ID or URL"
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                    />
                  </div>
                )}

                {/* Attachment file uploading (Routines, Video, Notice, and Study Materials PDF upload support) */}
                {["notice", "routine", "video", "materials"].includes(modalType) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-slate-400">Attach Document (PDF only)</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} 
                      className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                    />
                  </div>
                )}

                {/* Result specific inputs */}
                {modalType === "result" && (
                  <>
                    <div className="p-4 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-2xl flex flex-col gap-3">
                      <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-450 flex items-center gap-1.5"><Sliders size={12} /> Excel Data Importer</h4>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleExcelImport}
                        className="text-xs bg-white dark:bg-slate-900 p-2 border rounded-xl" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-slate-400">Student Roll Number</label>
                        <input 
                          type="text" 
                          value={studentRoll} 
                          onChange={(e) => setStudentRoll(e.target.value)} 
                          placeholder="e.g. 12"
                          className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-slate-400">Student Full Name</label>
                        <input 
                          type="text" 
                          value={studentNameField} 
                          onChange={(e) => setStudentNameField(e.target.value)} 
                          placeholder="e.g. Amit Das"
                          className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-slate-400">Term Exam Type</label>
                      <select 
                        value={examType} 
                        onChange={(e) => setExamType(e.target.value)} 
                        className="p-3 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-xl focus:outline-none"
                      >
                        {["First Unit Test", "Second Unit Test", "Third Unit Test", "Mock Board Exam", "Annual Examination"].map(et => <option key={et} value={et}>{et}</option>)}
                      </select>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-955 border dark:border-slate-850 rounded-2xl flex flex-col gap-3">
                      <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-450">Subject Scores (out of 100)</h4>
                      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                        {getSubjectsForClass(targetClass).map((sub) => (
                          <div key={sub} className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase text-slate-400 font-bold">{sub}</span>
                            <input 
                              type="number" 
                              max="100" 
                              value={subjectMarks[sub] || ""} 
                              onChange={(e) => setSubjectMarks({ ...subjectMarks, [sub]: parseInt(e.target.value) || 0 })}
                              className="p-2 border rounded-lg bg-white dark:bg-slate-900" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Footer Save Action */}
                <button
                  onClick={() => {
                    if (modalType === "homework") saveHomework();
                    if (modalType === "assignment") saveAssignment();
                    if (modalType === "notice") saveNotice();
                    if (modalType === "routine") saveRoutine();
                    if (modalType === "video") saveVideo();
                    if (modalType === "result") saveResult();
                    if (modalType === "materials") saveMaterial();
                  }}
                  className="w-full py-3 bg-school-blue hover:bg-school-blue-deep text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-school-blue/20 transition cursor-pointer"
                >
                  Save / Publish Record
                </button>

              </div>
            </motion.div>
          </div>
        )}

        {previewNoticeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border overflow-y-auto max-h-[90vh] ${
                darkMode ? "bg-slate-900 border-slate-800 text-slate-150" : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <button 
                onClick={() => setPreviewNoticeItem(null)} 
                className="absolute top-5 right-5 w-8 h-8 rounded-full border flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded border border-amber-200 uppercase tracking-widest">
                  {previewNoticeItem.category}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                  previewNoticeItem.status === "Published" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}>
                  {previewNoticeItem.status}
                </span>
              </div>

              <h2 className="font-black text-base md:text-lg uppercase tracking-tight mb-4 text-slate-800 dark:text-slate-100">
                {previewNoticeItem.title}
              </h2>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                Publish Date: {previewNoticeItem.publishDate ? new Date(previewNoticeItem.publishDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-4 text-xs">
                {/* Render General / Text notices */}
                {!["Examination Notice", "Class Routine"].includes(previewNoticeItem.category) && (
                  <p className="whitespace-pre-line leading-relaxed font-medium">
                    {previewNoticeItem.content}
                  </p>
                )}

                {/* Render Examination Notice Table */}
                {previewNoticeItem.category === "Examination Notice" && (() => {
                  let rows = [];
                  try {
                    rows = JSON.parse(previewNoticeItem.content);
                  } catch (_) {}
                  if (!Array.isArray(rows) || rows.length === 0) {
                    return <p className="text-slate-450 italic text-center py-4">No exam schedule records found or invalid data format.</p>;
                  }
                  return (
                    <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl mt-2">
                      <table className="min-w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-955 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-[9px] text-slate-400">
                            <th className="p-3">Subject</th>
                            <th className="p-3">Exam Date</th>
                            <th className="p-3">Day</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Full Marks</th>
                            <th className="p-3">Room</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r: any, idx: number) => (
                            <tr key={idx} className="border-b last:border-0 border-slate-100 dark:border-slate-800 font-medium">
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{r.subject || "-"}</td>
                              <td className="p-3">{r.examDate || "-"}</td>
                              <td className="p-3">{r.day || "-"}</td>
                              <td className="p-3">{r.time || "-"}</td>
                              <td className="p-3 font-semibold text-school-blue">{r.fullMarks || "-"}</td>
                              <td className="p-3 text-slate-500">{r.room || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* Render Class Routine Timetable */}
                {previewNoticeItem.category === "Class Routine" && (() => {
                  let timetable: any = null;
                  try {
                    timetable = JSON.parse(previewNoticeItem.content);
                  } catch (_) {}
                  if (!timetable) {
                    return <p className="text-slate-455 italic text-center py-4">No routine timetable records found or invalid data format.</p>;
                  }
                  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  return (
                    <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl mt-2">
                      <table className="min-w-full text-center border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-955 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-[9px] text-slate-400">
                            <th className="p-3 text-left">Day</th>
                            {Array(8).fill(null).map((_, i) => (
                              <th key={i} className="p-3 font-black">P{i + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {days.map(day => {
                            const periods = timetable[day] || [];
                            return (
                              <tr key={day} className="border-b last:border-0 border-slate-100 dark:border-slate-800 font-medium">
                                <td className="p-3 text-left font-black uppercase text-[9px] text-slate-400 bg-slate-55/50 dark:bg-slate-955/20">{day.substring(0, 3)}</td>
                                {Array(8).fill(null).map((_, pIdx) => {
                                  const p = periods[pIdx] || { subject: "", teacher: "" };
                                  return (
                                    <td key={pIdx} className="p-2 border-l border-slate-100 dark:border-slate-850 min-w-24">
                                      <div className="font-bold text-slate-800 dark:text-slate-200">{p.subject || "-"}</div>
                                      {p.teacher && <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{p.teacher}</div>}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {previewNoticeItem.pdfUrl && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attachments</span>
                  <a 
                    href={previewNoticeItem.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 text-xs font-bold text-school-blue transition"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      <span>Download Attached Circular (PDF)</span>
                    </div>
                    <FileDown size={14} />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
