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
    const { email, phone } = body;

    const userRole = pbServer.authStore.model.role;
    const userId = pbServer.authStore.model.id;
    const directoryRecordId = pbServer.authStore.model.directory_record;

    if (userRole !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Authenticate as superuser to bypass rules
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    // 1. Update in teacher_auth
    const updateData: Record<string, any> = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      await pbAdmin.collection("teacher_auth").update(userId, updateData);

      // 2. Synchronize to teacher_directory
      if (directoryRecordId) {
        const dirUpdateData: Record<string, any> = {};
        if (email) dirUpdateData.email = email;
        if (phone) dirUpdateData.phone = phone;
        
        await pbAdmin.collection("teacher_directory").update(directoryRecordId, dirUpdateData);
      }
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
