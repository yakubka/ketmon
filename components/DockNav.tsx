"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ReactNode } from "react";

type DockItem = {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-1, 1, -1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export function DockNav({ items }: { items: DockItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-40 -translate-x-1/2">
      <motion.div
        initial="initial"
        animate="animate"
        variants={floatingAnimation}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/90 p-2 shadow-xl backdrop-blur-lg"
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-label={item.label}>
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "group relative flex items-center justify-center rounded-full p-3 transition-colors",
                item.active ? "bg-teal-500 text-white" : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="h-5 w-5 flex-shrink-0 [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
