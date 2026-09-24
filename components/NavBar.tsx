"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useMessages } from "@/lib/useMessages";

type Messages = {
  nav: {
    home: string;
    bookings: string;
    wallet: string;
    profile: string;
    owner: string;
    member: string;
    dashboard: string;
    slots: string;
    revenue: string;
  };
};

export function NavBar({ role }: { role?: "MEMBER" | "OWNER" }) {
  const pathname = usePathname();
  const isOwnerSection = pathname.startsWith("/owner");
  const t = useMessages<Messages>();

  if (!t) return null;

  const memberLinks = [
    { href: "/home", label: t.nav.home },
    { href: "/bookings", label: t.nav.bookings },
    { href: "/wallet", label: t.nav.wallet },
    { href: "/profile", label: t.nav.profile },
  ];

  const ownerLinks = [
    { href: "/owner", label: t.nav.dashboard },
    { href: "/owner/slots", label: t.nav.slots },
    { href: "/owner/bookings", label: t.nav.bookings },
    { href: "/owner/revenue", label: t.nav.revenue },
  ];

  const links = isOwnerSection ? ownerLinks : memberLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/home" &&
              link.href !== "/owner" &&
              pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-col items-center px-3 py-1 text-[11px] font-medium transition-colors",
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        {!isOwnerSection && role === "OWNER" && (
          <Link
            href="/owner"
            className="flex flex-col items-center px-3 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
          >
            {t.nav.owner}
          </Link>
        )}
        {isOwnerSection && (
          <Link
            href="/home"
            className="flex flex-col items-center px-3 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
          >
            {t.nav.member}
          </Link>
        )}
      </div>
    </nav>
  );
}
