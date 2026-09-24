"use client";

import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/useMessages";
import { DockNav } from "@/components/DockNav";
import {
  HomeIcon,
  CalendarIcon,
  WalletIcon,
  UserIcon,
  ChartIcon,
  ClipboardIcon,
  CurrencyIcon,
  SwitchIcon,
} from "@/components/icons/NavIcons";
import type { ReactNode } from "react";

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
    navigation: string;
  };
};

export function NavBar({ role }: { role?: "MEMBER" | "OWNER" }) {
  const pathname = usePathname();
  const isOwnerSection = pathname.startsWith("/owner");
  const t = useMessages<Messages>();

  if (!t) return null;

  const memberLinks: { href: string; label: string; icon: ReactNode }[] = [
    { href: "/home", label: t.nav.home, icon: <HomeIcon /> },
    { href: "/bookings", label: t.nav.bookings, icon: <CalendarIcon /> },
    { href: "/wallet", label: t.nav.wallet, icon: <WalletIcon /> },
    { href: "/profile", label: t.nav.profile, icon: <UserIcon /> },
  ];

  const ownerLinks: { href: string; label: string; icon: ReactNode }[] = [
    { href: "/owner", label: t.nav.dashboard, icon: <ChartIcon /> },
    { href: "/owner/slots", label: t.nav.slots, icon: <ClipboardIcon /> },
    { href: "/owner/bookings", label: t.nav.bookings, icon: <CalendarIcon /> },
    { href: "/owner/revenue", label: t.nav.revenue, icon: <CurrencyIcon /> },
  ];

  const links = isOwnerSection ? ownerLinks : memberLinks;
  const isActive = (href: string) =>
    pathname === href || (href !== "/home" && href !== "/owner" && pathname.startsWith(href));

  const items = links.map((link) => ({
    href: link.href,
    label: link.label,
    icon: link.icon,
    active: isActive(link.href),
  }));

  if (!isOwnerSection && role === "OWNER") {
    items.push({ href: "/owner", label: t.nav.owner, icon: <SwitchIcon />, active: false });
  }
  if (isOwnerSection) {
    items.push({ href: "/home", label: t.nav.member, icon: <SwitchIcon />, active: false });
  }

  return <DockNav items={items} />;
}
