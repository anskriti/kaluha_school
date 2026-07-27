"use client";

import { PocketBaseAuthProvider } from "@/hooks/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PocketBaseAuthProvider>{children}</PocketBaseAuthProvider>;
}
