import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

export async function GET(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN or FACULTY
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || !["ADMIN", "FACULTY"].includes(pbServer.authStore.model.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";
    const className = searchParams.get("class") || "";
    const rollNumber = searchParams.get("roll") || "";
    const approvalStatus = searchParams.get("status") || "";

    const filterParts: string[] = [`role = "STUDENT"`];

    if (name) {
      // Escape single quotes for filter safety
      const escapedName = name.replace(/'/g, "\\'");
      filterParts.push(`name ~ '${escapedName}'`);
    }
    if (className) {
      filterParts.push(`className = "${className}"`);
    }
    if (rollNumber) {
      filterParts.push(`rollNumber = "${rollNumber}"`);
    }
    if (approvalStatus) {
      const mappedStatus = approvalStatus === "APPROVED" ? "Approved" : (approvalStatus === "REJECTED" ? "Rejected" : "Pending");
      filterParts.push(`approval_status = "${mappedStatus}"`);
    }

    const filterString = filterParts.join(" && ");
    const students = await pbServer.collection("students").getFullList({
      filter: filterString,
    });

    const mappedStudents = students.map(s => ({
      ...s,
      approvalStatus: s.approval_status === "Approved" ? "APPROVED" : (s.approval_status === "Rejected" ? "REJECTED" : "PENDING")
    }));

    return NextResponse.json({ success: true, data: mappedStudents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, approvalStatus, className, remarks } = body;

    if (!id || !approvalStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const student = await pbServer.collection("students").getOne(id);

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // Authenticate as superuser to bypass rules on updating 'verified' field
    await pbServer.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    const mappedStatus = approvalStatus === "APPROVED" ? "Approved" : (approvalStatus === "REJECTED" ? "Rejected" : "Pending");

    const updatedStudent = await pbServer.collection("students").update(id, {
      approval_status: mappedStatus,
      className: className || student.className,
      remarks: remarks || null,
      verified: approvalStatus === "APPROVED" ? true : student.verified,
    });

    const mappedUpdatedStudent = {
      ...updatedStudent,
      approvalStatus: updatedStudent.approval_status === "Approved" ? "APPROVED" : (updatedStudent.approval_status === "Rejected" ? "REJECTED" : "PENDING")
    };

    // Simulate sending email/in-app notification
    console.log(`
┌────────────────────────────────────────────────────────┐
│             🔔 simulated notification send             │
├────────────────────────────────────────────────────────┤
│ TO:      ${updatedStudent.email.padEnd(46)} │
│ SUBJECT: School Account Registration Updated            │
│ STATUS:  ${approvalStatus.padEnd(46)} │
│ REMARKS: ${(remarks || "None").padEnd(46)} │
└────────────────────────────────────────────────────────┘
    `);

    return NextResponse.json({ 
      success: true, 
      message: `Student account registration updated successfully. Simulated email sent to ${updatedStudent.email}.`,
      data: mappedUpdatedStudent
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
