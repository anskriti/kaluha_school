import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET study materials by class
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];
    if (className && className !== "ALL") {
      filterParts.push(`className = "${className}"`);
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

    const body = await req.json();
    const { className, subject, title, description, fileUrl } = body;

    if (!className || !subject || !title || !fileUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const record = await pbServer.collection("study_materials").create({
      className,
      subject,
      title,
      description: description || null,
      fileUrl,
      facultyId: pbServer.authStore.model.id,
      facultyName: pbServer.authStore.model.name || "Faculty Member",
    });

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

    await pbServer.collection("study_materials").delete(id);

    return NextResponse.json({ success: true, message: "Study material deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
