"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const MEMBER_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/bookings", label: "Bookings" },
  { href: "/wallet", label: "Wallet" },
  { href: "/profile", label: "Profile" },
];

const OWNER_LINKS = [
  { href: "/owner", label: "Dashboard" },
  { href: "/owner/slots", label: "Slots" },
  { href: "/owner/bookings", label: "Bookings" },
  { href: "/owner/revenue", label: "Revenue" },
];

export function NavBar({ role }: { role?: "MEMBER" | "OWNER" }) {
  const pathname = usePathname();
  const isOwnerSection = pathname.startsWith("/owner");
  const links = isOwnerSection ? OWNER_LINKS : MEMBER_LINKS;

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
            Owner
          </Link>
        )}
        {isOwnerSection && (
          <Link
            href="/home"
            className="flex flex-col items-center px-3 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
          >
            Member
          </Link>
        )}
      </div>
    </nav>
  );
}
