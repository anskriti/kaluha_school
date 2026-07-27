import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/pocketbase";
import { generateOTP, sendSimulatedSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, mobile, password, role, className, fatherName, rollNumber, dob } = body;

    if (!name || !username || !email || !mobile || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const pbServer = getPocketBaseServer();

    // Authenticate as superuser to allow lookup and creation across auth collections
    await pbServer.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    // Check if user already exists in either students or teachers_auth collections
    const filterString = `username = "${username}" || email = "${email}" || mobile = "${mobile}"`;
    let existingUser = null;
    try {
      existingUser = await pbServer.collection("students").getFirstListItem(filterString);
    } catch {
      try {
        existingUser = await pbServer.collection("teachers_auth").getFirstListItem(filterString);
      } catch {
        // not found is fine
      }
    }

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Username, Email, or Mobile number already registered" 
      }, { status: 400 });
    }

    const userApprovalStatus = role === "STUDENT" ? "PENDING" : "APPROVED";
    const targetCollection = role === "STUDENT" ? "students" : "teachers_auth";

    // Create payload depending on target collection
    const payload: Record<string, any> = {
      username,
      email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name,
      mobile,
      role: role || "STUDENT",
      verified: false, // Will verify via OTP in simulation
    };

    if (role === "STUDENT") {
      payload.className = className || "";
      payload.fatherName = fatherName || "";
      payload.rollNumber = rollNumber || "";
      payload.dob = dob || "";
      payload.approvalStatus = userApprovalStatus;
    } else {
      payload.approvalStatus = userApprovalStatus;
    }

    // Create the unverified user in the target collection in PocketBase
    const user = await pbServer.collection(targetCollection).create(payload);

    // Generate a random 6-digit OTP and send simulated SMS
    const otp = generateOTP(user.username);
    sendSimulatedSMS(user.mobile, `Your Kaluha Jagadishpur High School Portal verification OTP is ${otp}. Valid for 5 minutes.`);

    return NextResponse.json({ 
      success: true, 
      message: "Registration initialised. OTP sent.", 
      username: user.username,
      otp: otp // Return the OTP to let client notify
    });
  } catch (error: any) {
    let errorMessage = error.message;
    if (error.data && typeof error.data === "object" && Object.keys(error.data).length > 0) {
      errorMessage = Object.entries(error.data)
        .map(([key, val]: any) => `${key}: ${val.message || JSON.stringify(val)}`)
        .join(", ");
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
