"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Option = { value: string; label: string };

type WheelPickerProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const ITEM_H = 40;
const VISIBLE = 3;
const HALF = Math.floor(VISIBLE / 2);
const HEIGHT = ITEM_H * VISIBLE;
const PAD = ITEM_H * HALF;

export function WheelPicker({ options, value, onChange, label }: WheelPickerProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = options.find((o) => o.value === value)?.label || label;

  useEffect(() => {
    if (!open || !ref.current) return;
    const i = Math.max(0, options.findIndex((o) => o.value === value));
    setIdx(i);
    ref.current.scrollTo({ top: i * ITEM_H, behavior: "instant" as ScrollBehavior });
  }, [open, options, value]);

  const onScroll = useCallback(() => {
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.min(Math.max(0, i), options.length - 1);
    setIdx(clamped);

    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      }
    }, 80);
  }, [options.length]);

  function confirm() {
    onChange(options[idx].value);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors active:bg-slate-50"
      >
        {current}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-0.5 text-slate-400">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

          <div className="relative mb-4 w-full max-w-[240px] animate-slide-up rounded-2xl bg-white pb-4 shadow-xl">
            <div className="flex items-center justify-between px-3 py-2.5">
              <button onClick={() => setOpen(false)} className="text-xs text-slate-400">
                Cancel
              </button>
              <span className="text-xs font-semibold text-slate-800">{label}</span>
              <button onClick={confirm} className="text-xs font-semibold text-teal-500">
                Done
              </button>
            </div>

            <div className="relative mx-auto overflow-hidden" style={{ height: HEIGHT }}>
              <div
                className="pointer-events-none absolute inset-x-0 z-10"
                style={{ top: PAD, height: ITEM_H, borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}
              />

              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10"
                style={{ height: PAD, background: "linear-gradient(to bottom, white 20%, rgba(255,255,255,0.6))" }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
                style={{ height: PAD, background: "linear-gradient(to top, white 20%, rgba(255,255,255,0.6))" }}
              />

              <div
                ref={ref}
                onScroll={onScroll}
                className="h-full overflow-y-auto"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                <div style={{ height: PAD }} />
                {options.map((opt, i) => {
                  const dist = Math.abs(i - idx);
                  const opacity = dist === 0 ? 1 : dist === 1 ? 0.8 : 0.55;
                  const scale = dist === 0 ? 1 : dist === 1 ? 0.95 : 0.88;
                  const rotateX = dist === 0 ? 0 : dist === 1 ? (i < idx ? 18 : -18) : (i < idx ? 32 : -32);

                  return (
                    <div
                      key={opt.value}
                      className="flex cursor-pointer items-center justify-center select-none"
                      style={{
                        height: ITEM_H,
                        opacity,
                        transform: `perspective(300px) rotateX(${rotateX}deg) scale(${scale})`,
                        transition: "opacity 0.12s, transform 0.12s",
                      }}
                      onClick={() => {
                        setIdx(i);
                        ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
                      }}
                    >
                      <span
                        className={`text-base transition-colors ${dist === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}
                      >
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
                <div style={{ height: PAD }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
