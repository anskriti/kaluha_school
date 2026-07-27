import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET applications (ADMIN sees all, STUDENT sees their own)
export async function GET(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const filterParts: string[] = [];

    if (pbServer.authStore.model.role === "STUDENT") {
      filterParts.push(`studentId = "${pbServer.authStore.model.username}"`);
    }

    if (type) {
      filterParts.push(`type = "${type}"`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("applications").getFullList({
      filter: filterString,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST submit a new application
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);
    const body = await req.json();
    const { type, studentName, studentId, data } = body;

    if (!type || !studentName || !data) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let resolvedStudentId = studentId;
    if (!resolvedStudentId) {
      if (pbServer.authStore.isValid && pbServer.authStore.model) {
        resolvedStudentId = pbServer.authStore.model.username;
      } else {
        resolvedStudentId = "anonymous";
      }
    }

    const record = await pbServer.collection("applications").create({
      type,
      studentName,
      studentId: resolvedStudentId,
      data: typeof data === "string" ? data : JSON.stringify(data),
      status: "PENDING",
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update application status (ADMIN only)
export async function PUT(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    const record = await pbServer.collection("applications").update(id, { status });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
