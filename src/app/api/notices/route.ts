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

    let title = "";
    let category = "";
    let content = "";
    let pinned = false;
    let publishDateVal = "";
    let status = "Published";
    let id: string | null = null;
    let file: any = null;

    const contentType = req.headers.get("content-type") || "";

    // 1. Find every occurrence of JSON.parse() inside the Notice module:
    // We searched the Notice module (route.ts, notices/page.tsx, and notice editor in faculty/page.tsx)
    // and verified that no JSON.parse is used on plain fields (dates, title, category, status, etc.).
    // 2. Print every value before parsing.
    // 3. Identify which field contains invalid JSON (such as dates like 04-08-2026).
    // 4. Do NOT use JSON.parse() on: dates, title, description, category, status, strings.

    if (contentType.includes("application/json")) {
      const body = await req.json();
      console.log("Notice API: Parsing JSON request body", JSON.stringify(body, null, 2));

      title = body.title || "";
      category = body.category || "";
      content = body.content || "";
      pinned = body.pinned === true || body.pinned === "true" || body.pinned === "1";
      publishDateVal = body.publishDate || "";
      status = body.status || "Published";
      id = body.id || null;
    } else {
      const formData = await req.formData();
      console.log("Notice API: Parsing FormData request");
      const debugPayload: Record<string, any> = {};
      formData.forEach((value, key) => {
        debugPayload[key] = value instanceof File ? `[File: ${value.name} (${value.size} bytes)]` : value;
      });
      console.log("Notice API: FormData payload:", JSON.stringify(debugPayload, null, 2));

      title = formData.get("title") as string || "";
      category = formData.get("category") as string || "";
      content = formData.get("content") as string || "";
      const pinnedVal = formData.get("pinned");
      pinned = pinnedVal === "true" || pinnedVal === "1";
      publishDateVal = formData.get("publishDate") as string || "";
      status = formData.get("status") as string || "Published";
      id = (formData.get("id") as string) || null;
      file = formData.get("pdfUrl");
    }

    if (!title || !category || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 5. Store dates as ISO format: new Date(value).toISOString()
    let dateStr = new Date().toISOString();
    if (publishDateVal) {
      console.log("Formatting date to ISO format. Value before conversion:", publishDateVal);
      try {
        const parsedDate = new Date(publishDateVal);
        if (!isNaN(parsedDate.getTime())) {
          dateStr = parsedDate.toISOString();
        } else {
          // If standard new Date fails (e.g. DD-MM-YYYY like "05-08-2026"), try manual parsing
          const parts = publishDateVal.split(/[-/]/);
          if (parts.length === 3) {
            let first = parseInt(parts[0], 10);
            let second = parseInt(parts[1], 10);
            let third = parseInt(parts[2], 10);

            let year = third;
            let month = second - 1; // 0-indexed month
            let day = first;

            // Handle YYYY-MM-DD or other forms if parts are ordered differently
            if (parts[0].length === 4) {
              year = first;
              month = second - 1;
              day = third;
            }

            const customDate = new Date(year, month, day);
            if (!isNaN(customDate.getTime())) {
              dateStr = customDate.toISOString();
            } else {
              dateStr = new Date().toISOString();
            }
          } else {
            dateStr = new Date().toISOString();
          }
        }
      } catch (err: any) {
        console.error(`Invalid date string: "${publishDateVal}". Error message:`, err.message);
        dateStr = new Date().toISOString();
      }
    }

    // Build the clean PocketBase FormData object
    const pbFormData = new FormData();
    pbFormData.append("title", title);
    pbFormData.append("category", category);
    pbFormData.append("content", content);
    pbFormData.append("pinned", String(pinned));
    pbFormData.append("date", dateStr);
    pbFormData.append("publishDate", dateStr);
    pbFormData.append("status", status);

    if (file && file instanceof File) {
      pbFormData.append("pdfUrl", file);
    }

    // 6. Log the complete payload before sending it to PocketBase
    const payload = {
      title,
      category,
      content,
      pinned,
      date: dateStr,
      publishDate: dateStr,
      status,
      pdfUrl: file instanceof File ? `[File: ${file.name}]` : undefined
    };
    console.log("Notice payload", payload);

    const { searchParams } = new URL(req.url);
    const idFromQuery = searchParams.get("id");
    const targetId = id || idFromQuery;

    // Authenticate as superuser to save/update notices
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    let notice;
    if (targetId) {
      notice = await pbAdmin.collection("notices").update(targetId, pbFormData);
    } else {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let randId = '';
      for (let i = 0; i < 15; i++) {
        randId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      pbFormData.append("id", randId);
      notice = await pbAdmin.collection("notices").create(pbFormData);
    }

    // 7. Print the exact PocketBase response
    console.log("--- PocketBase Notice Saved Response ---");
    console.log(JSON.stringify(notice, null, 2));

    return NextResponse.json({ success: true, data: notice });
  } catch (error: any) {
    console.error("Notice save error stack:");
    console.error(error.stack || error);
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 });
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
