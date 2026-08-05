import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET results by studentId, class/roll, examType, or verified by DOB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const className = searchParams.get("className");
    const rollNumber = searchParams.get("rollNumber");
    const examType = searchParams.get("examType");
    const dob = searchParams.get("dob");

    const pbServer = getPocketBaseServer();

    if (dob && className && rollNumber) {
      // Query students collection to verify identity
      const studentMatch = await pbServer.collection("students").getFullList({
        filter: `className = "${className}" && rollNumber = "${rollNumber}" && dob = "${dob}"`
      });
      if (studentMatch.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const filterParts: string[] = [];

    if (studentId) {
      filterParts.push(`studentId = "${studentId}"`);
    }
    if (className) {
      filterParts.push(`className = "${className}"`);
    }
    if (rollNumber) {
      filterParts.push(`rollNumber = "${rollNumber}"`);
    }
    if (examType && examType !== "ALL") {
      filterParts.push(`examType = "${examType}"`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("results").getFullList({
      filter: filterString || undefined,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST enter/upload new result (FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (FACULTY only)
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, studentName, className, rollNumber, examType, subjectMarks, totalMarks, percentage, status } = body;

    if (!studentId || !studentName || !className || !rollNumber || !examType || !subjectMarks) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Authenticate as superuser to write results to PocketBase
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    const record = await pbAdmin.collection("results").create({
      studentId,
      studentName,
      className,
      rollNumber,
      examType,
      subjectMarks: typeof subjectMarks === "string" ? subjectMarks : JSON.stringify(subjectMarks),
      totalMarks: Number(totalMarks) || 0,
      percentage: Number(percentage) || 0,
      status: status || "PASS",
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE result (FACULTY only)
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
      return NextResponse.json({ success: false, error: "Missing result id" }, { status: 400 });
    }

    // Authenticate as superuser to delete results in PocketBase
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    await pbAdmin.collection("results").delete(id);

    return NextResponse.json({ success: true, message: "Result deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
