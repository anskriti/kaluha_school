export interface User {
  id: string;
  collectionId: string;
  collectionName: string;
  username: string;
  email: string;
  name: string;
  mobile: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  verified: boolean;
  className?: string;
  fatherName?: string;
  rollNumber?: string;
  dob?: string;
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  approval_status?: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  phone?: string;
  directory_record?: string;
  user_role?: string;
  created: string;
  updated: string;
}

export interface Notice {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  category: 'GENERAL' | 'ACADEMICS' | 'EXAMS' | 'ADMISSIONS';
  content: string;
  pdfUrl?: string; // pocketbase file name
  pinned: boolean;
  date: string;
  created: string;
  updated: string;
}

export interface Homework {
  id: string;
  collectionId: string;
  collectionName: string;
  className: string;
  subject: string;
  title: string;
  instruction: string;
  fileUrl?: string; // pocketbase file name
  facultyId: string;
  facultyName: string;
  deadline: string;
  created: string;
  updated: string;
}

export interface Assignment {
  id: string;
  collectionId: string;
  collectionName: string;
  className: string;
  subject: string;
  title: string;
  instruction: string;
  fileUrl?: string; // pocketbase file name
  facultyId: string;
  facultyName: string;
  deadline: string;
  created: string;
  updated: string;
}

export interface StudyMaterial {
  id: string;
  collectionId: string;
  collectionName: string;
  className: string;
  subject: string;
  title: string;
  description?: string;
  fileUrl: string; // pocketbase file name
  facultyId: string;
  facultyName: string;
  created: string;
  updated: string;
}

export interface Result {
  id: string;
  collectionId: string;
  collectionName: string;
  studentId: string;
  studentName: string;
  className: string;
  rollNumber: string;
  examType: string;
  subjectMarks: Record<string, number> | string;
  totalMarks: number;
  percentage: number;
  status: 'PASS' | 'FAIL';
  created: string;
  updated: string;
}

export interface Application {
  id: string;
  collectionId: string;
  collectionName: string;
  type: 'ADMISSION' | 'LIBRARY_CARD' | 'LEAVE' | 'TC' | 'NOC';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  studentId: string;
  studentName: string;
  data: Record<string, any> | string;
  created: string;
  updated: string;
}

export interface ContactRequest {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'RESOLVED';
  created: string;
  updated: string;
}

export interface AlumniProfile {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  batchYear: string;
  email: string;
  mobile: string;
  profession: string;
  achievements?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created: string;
  updated: string;
}

export interface Feedback {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  email: string;
  role: 'PARENT' | 'STUDENT' | 'VISITOR' | 'ALUMNI';
  content: string;
  rating: number;
  created: string;
  updated: string;
}

export interface Complaint {
  id: string;
  collectionId: string;
  collectionName: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  response?: string;
  status: 'PENDING' | 'RESOLVED';
  created: string;
  updated: string;
}

export interface Event {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  description: string;
  date: string;
  category: 'EXAM' | 'HOLIDAY' | 'SPORTS' | 'EVENT';
  created: string;
  updated: string;
}

export interface Teacher {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  designation: string;
  qualification: string;
  subjects: string;
  imageUrl?: string; // pocketbase file name
  phone?: string;
  email?: string;
  joinDate?: string;
  created: string;
  updated: string;
}

export interface SMCMember {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  designation: string;
  photoUrl?: string; // pocketbase file name
  created: string;
  updated: string;
}

export interface ManagingCommitteeMember {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  designation: string;
  photoUrl?: string; // pocketbase file name
  created: string;
  updated: string;
}

export interface WebSetting {
  id: string;
  collectionId: string;
  collectionName: string;
  key: string;
  value: string;
  created: string;
  updated: string;
}

export interface NewsletterSubscriber {
  id: string;
  collectionId: string;
  collectionName: string;
  email: string;
  created: string;
  updated: string;
}
