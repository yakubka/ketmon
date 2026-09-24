import type { Metadata } from "next";
import "./globals.css";
import { DemoPanelWrapper } from "@/components/DemoPanelWrapper";
import { NavBarWrapper } from "@/components/NavBarWrapper";

export const metadata: Metadata = {
  title: "Switch",
  description: "No-contract fitness credit marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="pb-16">{children}</div>
        <NavBarWrapper />
        <DemoPanelWrapper />
      </body>
    </html>
  );
}
