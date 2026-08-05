import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/pocketbase";
import { generateOTP, sendSimulatedSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, mobile, password, role, className, fatherName, rollNumber, dob, employeeId, selectedTeacherId } = body;

    if (!username || !email || !mobile || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const pbServer = getPocketBaseServer();

    // Authenticate as superuser to allow lookup and creation across auth collections
    await pbServer.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    let targetTeacher = null;
    if (role === "FACULTY") {
      // 1. Verify official staff membership
      if (selectedTeacherId) {
        try {
          targetTeacher = await pbServer.collection("teacher_directory").getOne(selectedTeacherId);
        } catch (_) {}
      }

      if (!targetTeacher && employeeId) {
        try {
          targetTeacher = await pbServer.collection("teacher_directory").getFirstListItem(`employee_id = "${employeeId}"`);
        } catch (_) {}
      }

      if (!targetTeacher) {
        return NextResponse.json({ success: false, error: "You are not an authorized staff member." }, { status: 400 });
      }

      // 2. Verify teacher doesn't already have an account
      let existingTeacherAuth = null;
      try {
        existingTeacherAuth = await pbServer.collection("teacher_auth").getFirstListItem(`directory_record = "${targetTeacher.id}" || email = "${email}"`);
      } catch (_) {}

      if (existingTeacherAuth) {
        return NextResponse.json({ success: false, error: "Account already exists." }, { status: 400 });
      }
    }

    // Check if user already exists in either students or teacher_auth collections
    const filterString = `username = "${username}" || email = "${email}" || mobile = "${mobile}"`;
    const teacherFilterString = `username = "${username}" || email = "${email}" || phone = "${mobile}"`;
    let existingUser = null;
    try {
      existingUser = await pbServer.collection("students").getFirstListItem(filterString);
    } catch {
      try {
        existingUser = await pbServer.collection("teacher_auth").getFirstListItem(teacherFilterString);
      } catch {
        // not found is fine
      }
    }

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Account already exists." 
      }, { status: 400 });
    }

    const targetCollection = role === "STUDENT" ? "students" : "teacher_auth";

    // Create payload depending on target collection
    const payload: Record<string, any> = {
      username,
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name: role === "STUDENT" ? name : (targetTeacher ? targetTeacher.name : ""),
      verified: false, // Will verify via OTP in simulation
    };

    if (role === "STUDENT") {
      payload.mobile = mobile;
      payload.role = "STUDENT";
      payload.className = className || "";
      payload.fatherName = fatherName || "";
      payload.rollNumber = rollNumber || "";
      payload.dob = dob || "";
      payload.approval_status = "Pending";
    } else {
      payload.phone = mobile;
      payload.role = "FACULTY";
      payload.approval_status = "Pending";
      payload.directory_record = targetTeacher?.id || "";
    }

    // Create the unverified user in the target collection in PocketBase
    const user = await pbServer.collection(targetCollection).create(payload);

    // Generate a random 6-digit OTP and send simulated SMS
    const otp = generateOTP(user.username);
    sendSimulatedSMS(role === "STUDENT" ? user.mobile : user.phone, `Your Kaluha Jagadishpur High School Portal verification OTP is ${otp}. Valid for 5 minutes.`);

    return NextResponse.json({ 
      success: true, 
      message: "Registration initialised. OTP sent.", 
      username: user.username,
      otp: otp // Return the OTP to let client notify
    });
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred.";
    if (error.data && typeof error.data === "object") {
      const dataErrors = error.data.data;
      if (dataErrors && Object.keys(dataErrors).length > 0) {
        const firstKey = Object.keys(dataErrors)[0];
        errorMessage = `${firstKey}: ${dataErrors[firstKey].message}`;
      } else {
        errorMessage = error.data.message || error.message || errorMessage;
      }
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
