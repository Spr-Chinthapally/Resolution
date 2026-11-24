import React from "react";
import { Eye } from "lucide-react";

export const ViewingDistanceSelector = ({ options, value, onChange }) => (
  <div data-testid="viewing-distance-selector">
    <div className="flex items-center gap-2">
      <Eye className="h-4 w-4 text-slate-400" />
      <h4 className="font-heading text-lg font-semibold text-slate-900">Viewing Distance</h4>
      <span className="text-xs text-slate-400">(optional)</span>
    </div>
    <p className="mt-1 text-sm text-slate-500">Affects the recommended target resolution.</p>

    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={[
              "rounded-lg border px-3 py-3 text-left transition-colors duration-200",
              active
                ? "border-sky-600 border-2 bg-sky-50/50"
                : "border-slate-200 bg-white hover:border-sky-300",
            ].join(" ")}
            data-testid={`viewing-distance-${o.value}`}
          >
            <div className={["text-sm font-semibold", active ? "text-slate-900" : "text-slate-700"].join(" ")}>
              {o.label}
            </div>
            {o.hint && <div className="mt-0.5 text-[11px] text-slate-400 leading-tight">{o.hint}</div>}
          </button>
        );
      })}
    </div>
  </div>
);
