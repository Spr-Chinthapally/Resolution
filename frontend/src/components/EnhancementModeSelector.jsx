import React from "react";
import { ShieldCheck, Sparkles, Check } from "lucide-react";

const ICONS = { print_accurate: ShieldCheck, ai_artwork: Sparkles };

export const EnhancementModeSelector = ({ modes, value, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="enhancement-mode-selector">
    {modes.map((m) => {
      const Icon = ICONS[m.value] || ShieldCheck;
      const active = value === m.value;
      return (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={[
            "relative text-left rounded-2xl border p-6 sm:p-7 transition-colors duration-200",
            active
              ? "border-sky-600 border-2 bg-sky-50/40 shadow-sm"
              : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50",
          ].join(" ")}
          data-testid={`enhancement-mode-${m.value}`}
        >
          {active && (
            <span className="absolute top-4 right-4 h-6 w-6 rounded-full bg-sky-600 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </span>
          )}
          <div
            className={[
              "h-12 w-12 rounded-xl flex items-center justify-center mb-4",
              active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div className="font-heading text-lg font-semibold text-slate-900">{m.label}</div>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{m.desc}</p>
          {m.value === "print_accurate" && (
            <span className="mt-3 inline-block text-[11px] font-mono uppercase tracking-widest text-sky-600">
              Recommended default
            </span>
          )}
        </button>
      );
    })}
  </div>
);
