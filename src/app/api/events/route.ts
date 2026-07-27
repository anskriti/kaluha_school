import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET all events
export async function GET() {
  try {
    const pbServer = getPocketBaseServer();
    const records = await pbServer.collection("events").getFullList({
      sort: "date",
    });
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST new event (ADMIN or FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (ADMIN or FACULTY)
    if (
      !pbServer.authStore.isValid ||
      !pbServer.authStore.model ||
      (pbServer.authStore.model.role !== "ADMIN" && pbServer.authStore.model.role !== "FACULTY")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, date, category } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, error: "Missing title or date" }, { status: 400 });
    }

    const record = await pbServer.collection("events").create({
      title,
      description: description || "",
      date: new Date(date).toISOString(),
      category: category || "EVENT",
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE event (ADMIN or FACULTY only)
export async function DELETE(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role (ADMIN or FACULTY)
    if (
      !pbServer.authStore.isValid ||
      !pbServer.authStore.model ||
      (pbServer.authStore.model.role !== "ADMIN" && pbServer.authStore.model.role !== "FACULTY")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing event id" }, { status: 400 });
    }

    await pbServer.collection("events").delete(id);

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
