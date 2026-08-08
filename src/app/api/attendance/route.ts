import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET attendance
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];

    if (className) {
      const normalizedClass = className.replace(/^Class\s+/i, "").trim();
      filterParts.push(`(className = "${normalizedClass}" || className = "Class ${normalizedClass}")`);
    }
    if (date) {
      filterParts.push(`date = "${date}"`);
    }
    if (studentId) {
      filterParts.push(`studentId = "${studentId}"`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("attendance").getFullList({
      filter: filterString || undefined,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST bulk save/update attendance (FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { date, className, records } = body;

    if (!date || !className || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Query existing attendance for this class and date
    const existing = await pbServer.collection("attendance").getFullList({
      filter: `className = "${className}" && date = "${date}"`,
    });

    const existingMap = new Map<string, string>();
    existing.forEach((rec) => {
      existingMap.set(rec.studentId, rec.id);
    });

    const savedRecords = [];
    for (const r of records) {
      if (!r.studentId || !r.studentName || !r.status) continue;
      
      const payload = {
        studentId: r.studentId,
        studentName: r.studentName,
        className,
        date,
        status: r.status,
        markedBy: pbServer.authStore.model.id,
      };

      const existingId = existingMap.get(r.studentId);
      let record;
      if (existingId) {
        record = await pbServer.collection("attendance").update(existingId, payload);
      } else {
        record = await pbServer.collection("attendance").create(payload);
      }
      savedRecords.push(record);
    }

    return NextResponse.json({ success: true, data: savedRecords });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
