"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-600 active:bg-brand-700 focus-visible:ring-brand/40",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-400/40",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400/40",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
