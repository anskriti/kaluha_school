import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET study materials by class
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let className = searchParams.get("className");
    if (className) {
      className = className.replace(/^Class\s+/i, "").trim();
    }

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];
    if (className && className !== "ALL") {
      filterParts.push(`(className = "${className}" || className = "Class ${className}")`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("study_materials").getFullList({
      filter: filterString,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST upload new study material (FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (FACULTY only)
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const className = formData.get("className") as string;
    const subject = formData.get("subject") as string;
    const title = formData.get("title") as string;
    const file = formData.get("fileUrl");

    if (!className || !subject || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // If it's a creation, make sure a file is provided
    if (!id && (!file || !(file instanceof File) || file.size === 0)) {
      return NextResponse.json({ success: false, error: "Study material file is required" }, { status: 400 });
    }

    formData.set("facultyId", pbServer.authStore.model.id);
    formData.set("facultyName", pbServer.authStore.model.name || "Faculty Member");

    // Authenticate as superuser to save/update study materials in PocketBase
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    let record;
    if (id) {
      formData.delete("id");
      record = await pbAdmin.collection("study_materials").update(id, formData);
    } else {
      record = await pbAdmin.collection("study_materials").create(formData);
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE study material (FACULTY only)
export async function DELETE(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (FACULTY only)
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing study material id" }, { status: 400 });
    }

    // Authenticate as superuser to delete study materials in PocketBase
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    await pbAdmin.collection("study_materials").delete(id);

    return NextResponse.json({ success: true, message: "Study material deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
