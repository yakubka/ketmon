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
    <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={floatingAnimation}
        className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/10 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur-lg"
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-label={item.label}>
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors",
                item.active ? "bg-teal-500 text-white" : "text-white/60 hover:text-white",
              )}
            >
              <span className="h-[18px] w-[18px] flex-shrink-0 [&>svg]:h-full [&>svg]:w-full">{item.icon}</span>
              {item.active && (
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              )}
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
