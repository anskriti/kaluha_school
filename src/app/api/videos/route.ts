import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET videos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const subject = searchParams.get("subject");

    const pbServer = getPocketBaseServer();
    const filterParts: string[] = [];

    if (className && className !== "ALL") {
      filterParts.push(`className = "${className}"`);
    }
    if (subject && subject !== "ALL") {
      filterParts.push(`subject = "${subject}"`);
    }

    const filterString = filterParts.join(" && ");
    const records = await pbServer.collection("videos").getFullList({
      filter: filterString || undefined,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create/update video (FACULTY only)
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
    const subject = formData.get("subject") as string;
    const title = formData.get("title") as string;
    const videoUrl = formData.get("videoUrl") as string;

    if (!className || !subject || !title || !videoUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    formData.set("facultyId", pbServer.authStore.model.id);
    formData.set("facultyName", pbServer.authStore.model.name || "Faculty Member");

    formData.delete("id");

    let record;
    if (id) {
      record = await pbServer.collection("videos").update(id, formData);
    } else {
      record = await pbServer.collection("videos").create(formData);
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE video (FACULTY only)
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
      return NextResponse.json({ success: false, error: "Missing video id" }, { status: 400 });
    }

    await pbServer.collection("videos").delete(id);

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
