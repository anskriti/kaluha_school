import PocketBase from "pocketbase";

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
  return serverPb;
}

/**
 * Utility helper to extract the cookie from Request headers
 */
export function getPbCookieFromRequest(req: Request): string {
  return req.headers.get("cookie") || "";
}
