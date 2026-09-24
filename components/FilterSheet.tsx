"use client";

import { CloseIcon } from "@/components/icons/UIIcons";

type Option = { value: string; label: string };

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  areaLabel: string;
  areaOptions: Option[];
  areaValue: string;
  onAreaChange: (value: string) => void;
  distanceLabel: string;
  distanceOptions: Option[];
  distanceValue: string;
  onDistanceChange: (value: string) => void;
  clearLabel: string;
  applyLabel: string;
  onClear: () => void;
};

export function FilterSheet({
  open,
  onClose,
  title,
  areaLabel,
  areaOptions,
  areaValue,
  onAreaChange,
  distanceLabel,
  distanceOptions,
  distanceValue,
  onDistanceChange,
  clearLabel,
  applyLabel,
  onClear,
}: FilterSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-2xl bg-white pb-6 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{areaLabel}</p>
          <div className="flex flex-wrap gap-2">
            {areaOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onAreaChange(opt.value)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                  areaValue === opt.value
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{distanceLabel}</p>
          <div className="flex flex-wrap gap-2">
            {distanceOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onDistanceChange(opt.value)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                  distanceValue === opt.value
                    ? "bg-teal-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3 px-5">
          <button
            onClick={onClear}
            className="flex-1 rounded-xl py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {clearLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
