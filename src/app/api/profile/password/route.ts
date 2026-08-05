import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const userEmail = pbServer.authStore.model.email;
    const userRole = pbServer.authStore.model.role;
    const collectionName = userRole === "FACULTY" ? "teacher_auth" : "students";
    const userId = pbServer.authStore.model.id;

    // 1. Verify old password by attempting a fresh authenticate
    const verificationPb = getPocketBaseServer();
    try {
      await verificationPb.collection(collectionName).authWithPassword(userEmail, oldPassword);
    } catch (_) {
      return NextResponse.json({ success: false, error: "Incorrect old password" }, { status: 400 });
    }

    // 2. Perform password update on the server
    await pbServer.collection(collectionName).update(userId, {
      password: newPassword,
      passwordConfirm: newPassword
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
