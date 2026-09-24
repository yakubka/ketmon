"use client";

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
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
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

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{distanceLabel}</p>
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

      <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3">
        <button onClick={onClear} className="text-xs font-medium text-slate-400 hover:text-slate-600">
          {clearLabel}
        </button>
        <button onClick={onClose} className="ml-auto text-xs font-semibold text-teal-600 hover:text-teal-700">
          {applyLabel}
        </button>
      </div>
    </div>
  );
}
