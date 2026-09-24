import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand/30",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export { Card };
