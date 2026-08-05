import PocketBase from "pocketbase";

// Global monkey-patch to automatically generate a 15-character alphanumeric ID for new records
const originalCollection = PocketBase.prototype.collection;
PocketBase.prototype.collection = function (idOrName: string) {
  const service = originalCollection.call(this, idOrName);
  const originalCreate = service.create;

  service.create = function <T = any>(bodyParams?: any, queryParams?: any): Promise<T> {
    const generateId = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 15; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    if (bodyParams instanceof FormData) {
      if (!bodyParams.has("id") || !bodyParams.get("id")) {
        bodyParams.set("id", generateId());
      }
    } else if (typeof bodyParams === "object" && bodyParams !== null) {
      if (!bodyParams.id) {
        bodyParams.id = generateId();
      }
    }

    return originalCreate.call(this, bodyParams, queryParams) as Promise<T>;
  };

  return service;
};

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!pbUrl) {
  console.warn("NEXT_PUBLIC_POCKETBASE_URL is not set. Falling back to http://127.0.0.1:8090");
}

export const pb = new PocketBase(pbUrl || "http://127.0.0.1:8090");

// Automatically sync the auth store to cookies in the browser
if (typeof window !== "undefined") {
  pb.authStore.onChange((token, model) => {
    // Write cookie that matches the current PocketBase auth state
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false, // Allow JS access so the client can update it
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
  });
}

/**
 * Creates a server-side PocketBase client pre-loaded with the user's cookies.
 * This is useful in Server Components and API Route Handlers.
 */
export function getPocketBaseServer(cookieHeader?: string | null) {
  const serverPb = new PocketBase(pbUrl || "http://127.0.0.1:8090");
  if (cookieHeader) {
    serverPb.authStore.loadFromCookie(cookieHeader);
  }
  
  // Enrich the auth model on the server client
  const model = serverPb.authStore.model;
  if (model) {
    const record = model as any;
    if (record.collectionName === "teacher_auth") {
      record.user_role = "teacher";
      record.role = "FACULTY";
      record.approval_status = record.approval_status || "Approved";
    } else if (record.collectionName === "students") {
      record.user_role = "student";
      record.role = "STUDENT";
      record.approval_status = record.approvalStatus || "Approved";
    } else if (record.collectionName === "users") {
      record.user_role = "admin";
      record.role = "ADMIN";
      record.approval_status = "Approved";
    }
  }
  
  return serverPb;
}

/**
 * Utility helper to extract the cookie from Request headers
 */
export function getPbCookieFromRequest(req: Request): string {
  return req.headers.get("cookie") || "";
}
