import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET all teachers
export async function GET() {
  try {
    const pbServer = getPocketBaseServer();
    const records = await pbServer.collection("teachers").getFullList();
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST new teacher profile (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, designation, qualification, subjects, imageUrl, phone, email, joinDate } = body;

    if (!name || !designation) {
      return NextResponse.json({ success: false, error: "Missing name or designation" }, { status: 400 });
    }

    const record = await pbServer.collection("teachers").create({
      name,
      designation,
      qualification: qualification || "",
      subjects: subjects || "",
      imageUrl: imageUrl || null,
      phone: phone || null,
      email: email || null,
      joinDate: joinDate || null,
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update teacher profile (ADMIN: all fields, FACULTY: own imageUrl only)
export async function PUT(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    if (!pbServer.authStore.isValid || !pbServer.authStore.model) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userRole = pbServer.authStore.model.role;
    const userEmail = pbServer.authStore.model.email;

    const body = await req.json();
    const { id, name, designation, qualification, subjects, imageUrl, phone, email, joinDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing teacher id" }, { status: 400 });
    }

    // Fetch target teacher record
    const targetTeacher = await pbServer.collection("teachers").getOne(id);

    if (userRole === "FACULTY") {
      // Must match email
      if (targetTeacher.email !== userEmail) {
        return NextResponse.json({ success: false, error: "Forbidden: You can only edit your own profile photo." }, { status: 403 });
      }

      // Faculty can only update imageUrl
      const record = await pbServer.collection("teachers").update(id, {
        imageUrl: imageUrl !== undefined ? imageUrl : targetTeacher.imageUrl,
      });
      return NextResponse.json({ success: true, data: record });
    } else if (userRole === "ADMIN") {
      // Admin can update all fields
      const record = await pbServer.collection("teachers").update(id, {
        ...(name && { name }),
        ...(designation && { designation }),
        ...(qualification !== undefined && { qualification }),
        ...(subjects !== undefined && { subjects }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(joinDate !== undefined && { joinDate }),
      });
      return NextResponse.json({ success: true, data: record });
    } else {
      return NextResponse.json({ success: false, error: "Unauthorized role" }, { status: 403 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE teacher profile (ADMIN only)
export async function DELETE(req: NextRequest) {
  try {
    const cookie = getPbCookieFromRequest(req);
    const pbServer = getPocketBaseServer(cookie);

    // Verify session and role ADMIN
    if (!pbServer.authStore.isValid || !pbServer.authStore.model || pbServer.authStore.model.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing teacher id" }, { status: 400 });
    }

    await pbServer.collection("teachers").delete(id);

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
