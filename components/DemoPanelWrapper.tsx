"use client";

import dynamic from "next/dynamic";

const DemoPanel = dynamic(
  () => import("@/components/DemoPanel").then((m) => ({ default: m.DemoPanel })),
  { ssr: false },
);

export function DemoPanelWrapper() {
  return <DemoPanel />;
}
