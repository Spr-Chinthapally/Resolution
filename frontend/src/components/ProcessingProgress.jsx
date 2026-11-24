import React from "react";
import { Check, Loader2, Printer } from "lucide-react";
import { PROCESSING_STAGES } from "@/services/imageEnhancementService";

export const ProcessingProgress = ({ activeIndex }) => {
  const total = PROCESSING_STAGES.length;
  const pct = Math.round(((activeIndex + 1) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto text-center" data-testid="processing-progress">
      <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto lp-pulse-ring">
        <Printer className="h-7 w-7 text-sky-600" strokeWidth={1.8} />
      </div>
      <h2 className="mt-6 font-heading text-2xl sm:text-3xl font-semibold text-slate-900">
        Preparing Your Image for Large-Format Printing
      </h2>
      <p className="mt-2 text-slate-500">This usually takes a moment. Please keep this window open.</p>

      <div className="mt-8">
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-sky-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
            data-testid="processing-bar"
          />
        </div>
        <div className="mt-2 text-right text-xs font-mono text-slate-400">{pct}%</div>
      </div>

      <div className="mt-8 space-y-3 text-left">
        {PROCESSING_STAGES.map((stage, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
          return (
            <div
              key={stage.key}
              className={[
                "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-200",
                active ? "border-sky-200 bg-sky-50/60" : done ? "border-slate-100 bg-white" : "border-slate-100 bg-white opacity-60",
              ].join(" ")}
              data-testid={`processing-stage-${stage.key}`}
            >
              <span
                className={[
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                  done ? "bg-emerald-500 text-white" : active ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-400",
                ].join(" ")}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                )}
              </span>
              <span className={["text-sm font-medium", active || done ? "text-slate-800" : "text-slate-400"].join(" ")}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
