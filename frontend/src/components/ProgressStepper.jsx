import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Print Setup" },
  { id: 3, label: "Analyze" },
  { id: 4, label: "Enhance" },
  { id: 5, label: "Download" },
];

export const ProgressStepper = ({ current }) => (
  <div className="w-full" data-testid="progress-stepper">
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2" data-testid={`step-${step.id}`}>
              <div
                className={[
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold font-mono border-2 transition-colors duration-200",
                  done
                    ? "bg-sky-600 border-sky-600 text-white"
                    : active
                    ? "bg-white border-sky-600 text-sky-600"
                    : "bg-white border-slate-200 text-slate-400",
                ].join(" ")}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
              </div>
              <span
                className={[
                  "text-xs font-medium whitespace-nowrap",
                  active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 sm:mx-4 -mt-6 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-300"
                  style={{ width: step.id < current ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);
