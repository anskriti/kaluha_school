"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    } else {
      const role = session.user.role.toLowerCase();
      router.push(`/dashboard/${role}`);
    }
  }, [session, status, router]);

  return (
    <div className="flex-1 flex items-center justify-center py-20 text-xs font-bold text-slate-400">
      Checking authentication, please wait...
    </div>
  );
}
