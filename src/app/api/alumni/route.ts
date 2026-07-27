import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedOnly = searchParams.get("approvedOnly");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];
    if (approvedOnly === "true") {
      filterParts.push('status = "APPROVED"');
    }

    const filterString = filterParts.join(" && ");
    const alumni = await pbServer.collection("alumni_profiles").getFullList({
      filter: filterString,
    });

    return NextResponse.json({ success: true, data: alumni });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, batchYear, email, mobile, profession, achievements } = body;

    if (!name || !batchYear || !email || !mobile || !profession) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const pbServer = getPocketBaseServer();
    const profile = await pbServer.collection("alumni_profiles").create({
      name,
      batchYear,
      email,
      mobile,
      profession,
      achievements: achievements || null,
      status: "PENDING",
    });

    return NextResponse.json({ success: true, data: profile });
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
    }

    const profile = await pbServer.collection("alumni_profiles").update(id, { status });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
