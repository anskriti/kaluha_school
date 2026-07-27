import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET all notices with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const pinned = searchParams.get("pinned");
    const search = searchParams.get("search");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];

    if (category && category !== "ALL") {
      filterParts.push(`category = "${category}"`);
    }
    if (pinned === "true") {
      filterParts.push("pinned = true");
    }
    if (search) {
      // Escape single quotes for safety
      const escapedSearch = search.replace(/'/g, "\\'");
      filterParts.push(`(title ~ '${escapedSearch}' || content ~ '${escapedSearch}')`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("notices").getFullList({
      filter: filterString,
      sort: "-pinned,-date",
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST new notice (ADMIN or FACULTY only)
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
    const { title, category, content, pdfUrl, pinned } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const notice = await pbServer.collection("notices").create({
      title,
      category,
      content,
      pdfUrl: pdfUrl || null,
      pinned: !!pinned,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: notice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE notice (ADMIN or FACULTY only)
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
      return NextResponse.json({ success: false, error: "Missing notice id" }, { status: 400 });
    }

    await pbServer.collection("notices").delete(id);

    return NextResponse.json({ success: true, message: "Notice deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
