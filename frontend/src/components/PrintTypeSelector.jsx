import React from "react";
import { Building2, Flag, Image, Store, Presentation, Shapes } from "lucide-react";

const ICONS = {
  billboard: Building2,
  banner: Flag,
  poster: Image,
  sign: Store,
  trade_show: Presentation,
  custom: Shapes,
};

export const PrintTypeSelector = ({ types, value, onChange }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="print-type-selector">
    {types.map((t) => {
      const Icon = ICONS[t.value] || Shapes;
      const active = value === t.value;
      return (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={[
            "text-left rounded-xl border p-5 transition-colors duration-200",
            active
              ? "border-sky-600 border-2 bg-sky-50/50 shadow-sm"
              : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50",
          ].join(" ")}
          data-testid={`print-type-${t.value}`}
        >
          <div
            className={[
              "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
              active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div className={["font-semibold", active ? "text-slate-900" : "text-slate-800"].join(" ")}>
            {t.label}
          </div>
          <div className="mt-1 text-xs text-slate-500 leading-snug">{t.desc}</div>
        </button>
      );
    })}
  </div>
);
