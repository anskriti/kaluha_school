import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Kaluha Jagadishpur High School database...");

  // Clean existing tables
  await prisma.user.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.sMCMember.deleteMany({});
  await prisma.managingCommitteeMember.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.webSetting.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.homework.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.studyMaterial.deleteMany({});
  await prisma.application.deleteMany({});

  // Hash passwords
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("password123", salt);

  // 1. Create Default Users
  const admin = await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      email: "admin@kaluhajhighschool.in",
      mobile: "9434582037",
      password: hashedPassword,
      role: "ADMIN",
      verified: true
    }
  });

  const faculty = await prisma.user.create({
    data: {
      name: "Subrata Sen",
      username: "faculty",
      email: "subrata@kaluhajhighschool.in",
      mobile: "9434582038",
      password: hashedPassword,
      role: "FACULTY",
      verified: true
    }
  });

  const student = await prisma.user.create({
    data: {
      name: "Amit Das",
      username: "student",
      email: "amit@kaluhajhighschool.in",
      mobile: "9434582039",
      password: hashedPassword,
      role: "STUDENT",
      verified: true
    }
  });

  console.log("Users seeded successfully:", { admin: admin.username, faculty: faculty.username, student: student.username });

  // 2. Create Notices
  await prisma.notice.createMany({
    data: [
      {
        title: "National Means-Cum-Merit Scholarship Examination (NMMSE) 2024",
        category: "ADMISSIONS",
        content: "Applications are invited for the NMMSE 2024 for Class VIII students. Eligible candidates having family income less than Rs. 3,50,000/- per annum can apply. The last date for online submission is August 31, 2024. Please contact the class teacher for form verification.",
        pinned: true,
        date: new Date()
      },
      {
        title: "Class X Mock Board Examination Schedule 2024",
        category: "EXAMS",
        content: "The Mock Board Examination for Class X will commence from September 10, 2024. All students must clear their school fees before collecting their admit cards. View/Download the timetable under Exam Routine in Downloads.",
        pinned: false,
        date: new Date()
      },
      {
        title: "Kanyashree Prakalpa (K1 & K2) Renewal Notice",
        category: "GENERAL",
        content: "All eligible female students of Class VIII to X are directed to submit their filled-in Kanyashree Prakalpa forms by September 5, 2024. Documents required: Income Certificate, Aadhaar Copy, Bank Passbook, and School Progress Card.",
        pinned: true,
        date: new Date()
      }
    ]
  });

  // 3. Create Official Teachers (17 Staff Members)
  await prisma.teacher.createMany({
    data: [
      { name: "MANABENDRA MONDAL", designation: "HEAD MASTER", qualification: "M.A., B.Ed.", subjects: "School Administration & Leadership" },
      { name: "PRIYOJYOTI BHATTACHARYYA", designation: "ASSISTANT TEACHER", qualification: "M.A., B.Ed.", subjects: "English" },
      { name: "SOMESHWAR MURMU", designation: "ASSISTANT TEACHER", qualification: "B.A. (Hons.), B.Ed.", subjects: "History" },
      { name: "DEBDULAL BHATTACHARYYA", designation: "ASSISTANT TEACHER", qualification: "B.A., B.Ed.", subjects: "Bengali" },
      { name: "SANDIP CHOUDHURY", designation: "ASSISTANT TEACHER", qualification: "M.Sc., B.Ed.", subjects: "Life Science" },
      { name: "PARTHO PROTIM DAS", designation: "ASSISTANT TEACHER", qualification: "B.A. (Hons.), B.Ed.", subjects: "Mathematics" },
      { name: "MD ARIF", designation: "ASSISTANT TEACHER", qualification: "B.A./M.A., B.Ed.", subjects: "English" },
      { name: "TOTON LET", designation: "ASSISTANT TEACHER", qualification: "B.A., B.Ed.", subjects: "Sanskrit" },
      { name: "NABA KUMAR SAHA", designation: "ASSISTANT TEACHER", qualification: "M.Sc., B.Ed.", subjects: "Physical Science" },
      { name: "TARAK NATH MONDAL", designation: "ASSISTANT TEACHER", qualification: "B.A., P.P.Ed., B.Ed.", subjects: "Physical Education" },
      { name: "SRIKANTA MONDAL", designation: "Group D Staff", qualification: "Higher Secondary", subjects: "General Support Staff" },
      { name: "ANAMIKA CHATTERJEE", designation: "PARA TEACHER", qualification: "B.A.", subjects: "Bengali" },
      { name: "HASINA KHAUN", designation: "PARA TEACHER", qualification: "B.Sc., D.El.Ed.", subjects: "Science" },
      { name: "HAIDER ALI", designation: "PARA TEACHER", qualification: "B.A., D.El.Ed.", subjects: "Geography" },
      { name: "MD. NISAR", designation: "COMPUTER TEACHER", qualification: "M.A. (Computer)", subjects: "Computer Science" }
    ]
  });

  // 4. Create SMC Members
  await prisma.sMCMember.createMany({
    data: [
      { name: "Anil Chandra Ghosh", designation: "President" },
      { name: "Subrata Sen", designation: "Secretary (HOI Representative)" },
      { name: "Pradip Kumar Das", designation: "Guardian Representative" },
      { name: "Minati Roy", designation: "Female Guardian Representative" }
    ]
  });

  // 5. Create Managing Committee Members
  await prisma.managingCommitteeMember.createMany({
    data: [
      { name: "Samarjit Mondal", designation: "President" },
      { name: "Pranab Mukherjee", designation: "Member (SMC)" },
      { name: "Debashis Chowdhury", designation: "Teacher Representative" },
      { name: "Sudip Mondal", designation: "Non-Teaching Staff Representative" }
    ]
  });

  // 6. Create Calendar Events
  await prisma.event.createMany({
    data: [
      {
        title: "Annual Sports Meet 2024",
        description: "Annual school sports event involving track and field events, football tournament, and prize distribution.",
        date: new Date("2024-11-20T00:00:00.000Z"),
        category: "SPORTS"
      },
      {
        title: "Independence Day Celebration",
        description: "Flag hoisting, cultural performance, national song competition, and sweet distribution.",
        date: new Date("2024-08-15T00:00:00.000Z"),
        category: "EVENT"
      },
      {
        title: "Half-Yearly Exams",
        description: "Mid-term examinations for Classes V through X.",
        date: new Date("2024-09-18T00:00:00.000Z"),
        category: "EXAM"
      },
      {
        title: "Durga Puja Holidays",
        description: "School closed for Durga Puja, Lakshmi Puja, and Kali Puja vacations.",
        date: new Date("2024-10-09T00:00:00.000Z"),
        category: "HOLIDAY"
      }
    ]
  });

  // 7. Create default WebSettings for CMS
  await prisma.webSetting.createMany({
    data: [
      {
        key: "welcome_message",
        value: "Welcome to Kaluha Jagadishpur High School, a government-aided secondary school situated in the heart of Rampurhat-II, Birbhum, West Bengal. We are committed to fostering academic excellence, moral integrity, and social responsibility in our students from classes V to X."
      },
      {
        key: "hoi_message",
        value: "Dear Students, Parents, and Well-wishers,\n\nIt is my privilege to welcome you all to the digital portal of Kaluha Jagadishpur High School. Our institution has been a beacon of learning since its establishment in 1961/1962, shaping young minds in the Birbhum district.\n\nWe believe education is not merely acquiring knowledge but developing character, creativity, and critical thinking. Our team of dedicated educators works tirelessly to provide a safe, nurturing, and stimulating environment where every student can discover and achieve their full potential.\n\nWith warm regards,\nHeadmaster / Teacher-in-Charge\nKALUHA JAGADISHPUR HIGH SCHOOL"
      },
      {
        key: "school_history",
        value: "Kaluha Jagadishpur High School was established in 1962 (as per historical records, with the official emblem showing the establishment year of 1961) by local educationists and philanthropists who felt the pressing need for a secondary school in the remote agrarian villages of Margram and Kaluha in Birbhum district. Over the decades, it has grown from a humble clay structure to a two-story facility, providing secondary education (classes V to X) under the West Bengal Board of Secondary Education (WBBSE)."
      },
      {
        key: "slider_images",
        value: JSON.stringify([
          "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/776290.jpeg",
          "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/400319.jpg",
          "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/6991.jpg",
          "https://school.banglarshiksha.gov.in/sms/templates/uploads/ws/31425/735275.jpeg"
        ])
      },
      {
        key: "school_stats",
        value: JSON.stringify({
          studentsCount: 480,
          teachersCount: 15,
          classroomsCount: 12,
          passRatePercentage: 98
        })
      }
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
