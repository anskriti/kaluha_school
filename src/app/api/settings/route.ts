import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET all web settings or a single key
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    const pbServer = getPocketBaseServer();

    if (key) {
      try {
        const record = await pbServer.collection("web_settings").getFirstListItem(`key="${key}"`);
        return NextResponse.json({ success: true, data: record.value });
      } catch {
        return NextResponse.json({ success: true, data: null });
      }
    }

    const records = await pbServer.collection("web_settings").getFullList();
    const settingsMap = records.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST update web settings (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Missing key or value" }, { status: 400 });
    }

    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    let record;
    try {
      const existing = await pbServer.collection("web_settings").getFirstListItem(`key="${key}"`);
      record = await pbServer.collection("web_settings").update(existing.id, { value: stringValue });
    } catch {
      record = await pbServer.collection("web_settings").create({ key, value: stringValue });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
