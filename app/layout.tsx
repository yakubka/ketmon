import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ketmon",
  description: "No-contract fitness credit marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
