import React from "react";
import { CheckCircle2, Info, FlaskConical, AlertTriangle } from "lucide-react";
import { unitLabel } from "@/utils/format";

export const PrintReadinessCard = ({ project, mock, meetsTarget }) => {
  const u = unitLabel(project.printUnit);

  // Demo/mock: never claim genuine print readiness.
  if (mock) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7" data-testid="print-readiness-card">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Print Readiness</div>
            <h3 className="mt-1 font-heading text-xl font-semibold text-slate-800">Demo Preview Complete</h3>
            <p className="mt-2 text-sm text-slate-600">
              The workflow is complete. Final print readiness will be verified from the actual output produced by the
              external AI-processing service.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500">Print size: </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {project.printWidth} × {project.printHeight} {u}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Target PPI: </span>
                <span className="font-semibold text-slate-800 font-mono">{project.targetPPI} PPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Real service connected but output did not reach the required target.
  if (!meetsTarget) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-7" data-testid="print-readiness-card">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Print Readiness</div>
            <h3 className="mt-1 font-heading text-xl font-semibold text-amber-800">Output Below Target Resolution</h3>
            <p className="mt-2 text-sm text-amber-800/90">
              The enhanced file is {project.actualOutputWidth} × {project.actualOutputHeight} px, below the
              {" "}{project.targetOutputWidth} × {project.targetOutputHeight} px target for this print size.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real service connected and output meets the target.
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-7" data-testid="print-readiness-card">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500">Print Readiness</div>
          <h3 className="mt-1 font-heading text-xl font-semibold text-emerald-800">Ready for Selected Print Size</h3>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-slate-500">Print size: </span>
              <span className="font-semibold text-slate-800 font-mono">
                {project.printWidth} × {project.printHeight} {u}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Effective resolution: </span>
              <span className="font-semibold text-slate-800 font-mono">{project.targetPPI} PPI</span>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-emerald-800/80">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Actual output {project.actualOutputWidth} × {project.actualOutputHeight} px meets the required target.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
