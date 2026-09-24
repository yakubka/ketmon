import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type TimeBandVariant = "OFF_PEAK" | "STANDARD" | "PEAK";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TimeBandVariant;
}

const variantStyles: Record<TimeBandVariant, string> = {
  OFF_PEAK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  STANDARD: "bg-slate-100 text-slate-600 border-slate-200",
  PEAK: "bg-amber-50 text-amber-700 border-amber-200",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "STANDARD", ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps, TimeBandVariant };
