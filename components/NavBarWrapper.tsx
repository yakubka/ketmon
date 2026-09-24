"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NavBar } from "./NavBar";

const PUBLIC_PATHS = ["/", "/auth", "/privacy", "/terms", "/onboarding"];

export function NavBarWrapper() {
  const pathname = usePathname();
  const [role, setRole] = useState<"MEMBER" | "OWNER" | undefined>();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/auth"))) {
      setShow(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setShow(true);
        fetch(`/api/auth/role?email=${encodeURIComponent(data.user.email)}`)
          .then((r) => r.json())
          .then((d) => setRole(d.role ?? "MEMBER"));
      }
    });
  }, [pathname]);

  if (!show) return null;
  return <NavBar role={role} />;
}
