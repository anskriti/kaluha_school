import { NextResponse } from "next/server";
import { getSMSLogs } from "@/lib/sms";

export async function GET() {
  try {
    const logs = getSMSLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
