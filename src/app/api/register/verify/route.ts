import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer } from "@/lib/pocketbase";
import { verifyOTP } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, otp } = body;

    if (!username || !otp) {
      return NextResponse.json({ success: false, error: "Missing username or OTP" }, { status: 400 });
    }

    // Verify OTP using simulated SMS gateway helper
    if (!verifyOTP(username, otp)) {
      return NextResponse.json({ success: false, error: "Invalid OTP code. Please enter the code sent to your simulated phone." }, { status: 400 });
    }

    const pbServer = getPocketBaseServer();

    // Authenticate as superuser to bypass rules on updating 'verified' field
    await pbServer.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    // Find the user by username in either students or teachers_auth
    let userRecord = null;
    let collectionName = "";
    try {
      userRecord = await pbServer.collection("students").getFirstListItem(`username="${username}"`);
      collectionName = "students";
    } catch {
      userRecord = await pbServer.collection("teachers_auth").getFirstListItem(`username="${username}"`);
      collectionName = "teachers_auth";
    }

    // Update verified status to true
    const updatedUser = await pbServer.collection(collectionName).update(userRecord.id, { 
      verified: true 
    });

    const approvalMsg = updatedUser.role === "STUDENT" 
      ? "Your registration has been submitted successfully and is awaiting approval from the school administrator."
      : "Account verified successfully! You can now log in.";

    return NextResponse.json({ 
      success: true, 
      message: approvalMsg,
      user: {
        username: updatedUser.username,
        role: updatedUser.role,
        verified: updatedUser.verified
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
