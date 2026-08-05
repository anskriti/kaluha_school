import { NextRequest, NextResponse } from "next/server";
import { getPocketBaseServer, getPbCookieFromRequest } from "@/lib/pocketbase";

// GET all teachers
export async function GET() {
  try {
    const pbServer = getPocketBaseServer();
    // Fetch all active teachers from teacher_directory
    const records = await pbServer.collection("teacher_directory").getFullList({
      filter: "is_active = true"
    });
    
    // Map them to match the expected format on the frontend
    const mapped = records.map((r: any) => {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      const photoUrl = r.photo ? `${pbUrl}/api/files/teacher_directory/${r.id}/${r.photo}` : "";
      return {
        id: r.id,
        name: r.name,
        designation: r.designation,
        qualification: r.qualification,
        subjects: r.subject_role, // Maps subject_role to subjects
        imageUrl: photoUrl, // Maps photo to imageUrl
        email: r.email,
        phone: r.phone,
        joinDate: r.created,
        employee_id: r.employee_id
      };
    });

    return NextResponse.json({ success: true, data: mapped });
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
    const { name, designation, qualification, subjects, phone, email, employee_id, is_active } = body;

    if (!name || !designation || !employee_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Authenticate as superuser to save
    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    const record = await pbAdmin.collection("teacher_directory").create({
      name,
      designation,
      qualification: qualification || "",
      subject_role: subjects || "",
      email: email || "",
      employee_id,
      is_active: is_active !== undefined ? is_active : true
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

    const model = pbServer.authStore.model;
    const collectionName = model.collectionName;
    const userId = model.id;
    const directoryRecordId = model.directory_record;

    // Print the entire authenticated session
    console.log("--- Authenticated Session Model ---");
    console.log(JSON.stringify(model, null, 2));

    // Determine and enforce roles
    let userRole = model.role || model.user_role;
    if (collectionName === "teacher_auth") {
      userRole = "FACULTY";
      model.user_role = "teacher";
      model.role = "FACULTY";
    } else if (collectionName === "students") {
      userRole = "STUDENT";
      model.user_role = "student";
      model.role = "STUDENT";
    } else if (collectionName === "users") {
      userRole = "ADMIN";
      model.user_role = "admin";
      model.role = "ADMIN";
    }

    console.log("session.user_role:", model.user_role);
    console.log("session.role:", model.role);
    console.log("session.collectionName:", collectionName);
    console.log("session.record:", JSON.stringify(model, null, 2));

    const body = await req.json();
    const { id, imageUrl } = body;

    if (collectionName === "teacher_auth" || userRole === "FACULTY") {
      if (imageUrl === "" || imageUrl === null || body.deletePhoto) {
        // Clear photo in both teacher_auth and teacher_directory
        const pbAdmin = getPocketBaseServer();
        await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

        await pbAdmin.collection("teacher_auth").update(userId, {
          profile_photo: null
        });

        if (directoryRecordId) {
          await pbAdmin.collection("teacher_directory").update(directoryRecordId, {
            photo: null
          });
        }

        return NextResponse.json({ success: true, data: { imageUrl: null } });
      }

      if (!imageUrl) {
        return NextResponse.json({ success: false, error: "Missing image data" }, { status: 400 });
      }

      // Convert base64 data URL to file buffer
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const mimeTypeMatch = imageUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const extension = mimeType.split("/")[1] || "jpg";
      const buffer = Buffer.from(base64Data, 'base64');

      // Authenticate as superuser to perform administrative updates
      const pbAdmin = getPocketBaseServer();
      await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

      // 1. Save in teacher_auth.profile_photo
      const authFormData = new FormData();
      const authBlob = new Blob([buffer], { type: mimeType });
      authFormData.append("profile_photo", authBlob, `profile_${userId}.${extension}`);
      
      const updatedAuth = await pbAdmin.collection("teacher_auth").update(userId, authFormData);

      // 2. Synchronize to teacher_directory.photo
      if (directoryRecordId) {
        const dirFormData = new FormData();
        const dirBlob = new Blob([buffer], { type: mimeType });
        dirFormData.append("photo", dirBlob, `photo_${directoryRecordId}.${extension}`);
        
        await pbAdmin.collection("teacher_directory").update(directoryRecordId, dirFormData);
      }

      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      const finalPhotoUrl = `${pbUrl}/api/files/teacher_auth/${userId}/${updatedAuth.profile_photo}`;

      return NextResponse.json({ success: true, data: { imageUrl: finalPhotoUrl } });
    } else if (userRole === "ADMIN") {
      if (!id) {
        return NextResponse.json({ success: false, error: "Missing teacher id" }, { status: 400 });
      }

      const pbAdmin = getPocketBaseServer();
      await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

      const record = await pbAdmin.collection("teacher_directory").update(id, {
        ...(body.name && { name: body.name }),
        ...(body.designation && { designation: body.designation }),
        ...(body.qualification !== undefined && { qualification: body.qualification }),
        ...(body.subjects !== undefined && { subject_role: body.subjects }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.employee_id !== undefined && { employee_id: body.employee_id }),
        ...(body.is_active !== undefined && { is_active: body.is_active })
      });

      return NextResponse.json({ success: true, data: record });
    } else {
      return NextResponse.json({ success: false, error: "Unauthorized role" }, { status: 403 });
    }
  } catch (error: any) {
    console.error("Teacher profile update error stack:");
    console.error(error.stack || error);
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 });
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

    const pbAdmin = getPocketBaseServer();
    await pbAdmin.collection('_superusers').authWithPassword('admin@kaluha.com', 'password123');

    // Deactivate instead of hard delete to preserve historical integrity, or hard delete if desired
    await pbAdmin.collection("teacher_directory").delete(id);

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
