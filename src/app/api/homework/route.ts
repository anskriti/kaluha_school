import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET homework by class
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
    const records = await pbServer.collection("homeworks").getFullList({
      filter: filterString,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST upload new homework (FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (FACULTY only)
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { className, subject, title, instruction, fileUrl, deadline } = body;

    if (!className || !subject || !title || !instruction) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const defaultDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const deadlineStr = deadline ? new Date(deadline).toISOString() : defaultDeadline;

    const record = await pbServer.collection("homeworks").create({
      className,
      subject,
      title,
      instruction,
      fileUrl: fileUrl || null,
      facultyId: pbServer.authStore.model.id,
      facultyName: pbServer.authStore.model.name || "Faculty Member",
      deadline: deadlineStr,
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE homework (FACULTY only)
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
      return NextResponse.json({ success: false, error: "Missing homework id" }, { status: 400 });
    }

    await pbServer.collection("homeworks").delete(id);

    return NextResponse.json({ success: true, message: "Homework deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
