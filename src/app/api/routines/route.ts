import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET routines
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const type = searchParams.get("type");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];

    if (className && className !== "ALL") {
      filterParts.push(`className = "${className}"`);
    }
    if (type) {
      filterParts.push(`type = "${type}"`);
    }

    // Only return PUBLISHED routines for students / public, but let teachers see DRAFT if authenticated.
    let isFaculty = false;
    try {
      const cookie = getPbCookieFromRequest(req);
      const authPb = getPocketBaseServer(cookie);
      if (authPb.authStore.isValid && authPb.authStore.model && authPb.authStore.model.role === "FACULTY") {
        isFaculty = true;
      }
    } catch (_) {}

    if (!isFaculty) {
      filterParts.push(`status = "PUBLISHED"`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("routines").getFullList({
      filter: filterString || undefined,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create/update routine (FACULTY only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const className = formData.get("className") as string;
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const status = formData.get("status") as string;

    if (!type || !title || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    formData.set("facultyId", pbServer.authStore.model.id);
    formData.set("facultyName", pbServer.authStore.model.name || "Faculty Member");

    // Remove id from formData so pb doesn't try to create a field named 'id'
    formData.delete("id");

    let record;
    if (id) {
      record = await pbServer.collection("routines").update(id, formData);
    } else {
      record = await pbServer.collection("routines").create(formData);
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE routine (FACULTY only)
export async function DELETE(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing routine id" }, { status: 400 });
    }

    await pbServer.collection("routines").delete(id);

    return NextResponse.json({ success: true, message: "Routine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
