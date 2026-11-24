import React from "react";
import {
  Info,
  ArrowUpRight,
  Maximize2,
  Gauge,
  Target,
  Layers,
  Wand2,
  CheckCircle2,
  Crop,
  Scan,
  Ruler,
  AlertTriangle,
} from "lucide-react";
import { QUALITY_META, enhancementHeadline, aspectInfo } from "@/utils/printCalc";
import { formatNumber, unitLabel } from "@/utils/format";

const Cell = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-mono uppercase tracking-widest">{label}</span>
    </div>
    <div className={`mt-2 text-2xl font-mono font-bold ${accent ? "text-sky-700" : "text-slate-900"}`}>
      {value}
    </div>
    {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
  </div>
);

const FIT_OPTIONS = [
  { value: "crop_fill", label: "Crop to Fill", desc: "Crop the image proportionally so the complete print area is filled.", icon: Crop },
  { value: "fit_entire", label: "Fit Entire Image", desc: "Keep the entire source image and allow unused print area where necessary.", icon: Scan },
  { value: "change_size", label: "Change Print Size", desc: "Return to print-size selection.", icon: Ruler },
];

export const ResolutionAnalysis = ({ project, fitMode, onFitMode, onChangeSize }) => {
  const meta = QUALITY_META[project.sourceQuality] || QUALITY_META.needs_enhancement;
  const u = unitLabel(project.printUnit);
  const head = enhancementHeadline(project.requiredEnlargement, project.requiredPixelWidth, project.requiredPixelHeight);
  const aspect = aspectInfo(project.imageWidth, project.imageHeight, project.printWidth, project.printHeight);
  const ready = head.status === "ready";

  return (
    <div data-testid="resolution-analysis">
      {/* Primary enhancement message */}
      <div
        className={[
          "rounded-2xl border p-5 sm:p-6 flex items-start gap-4",
          ready ? "border-emerald-200 bg-emerald-50/70" : "border-sky-200 bg-sky-50/70",
        ].join(" ")}
        data-testid="enhancement-headline"
      >
        <div
          className={[
            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
            ready ? "bg-emerald-500" : "bg-sky-600",
          ].join(" ")}
        >
          {ready ? <CheckCircle2 className="h-6 w-6 text-white" /> : <Wand2 className="h-6 w-6 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-xl font-semibold text-slate-900">{head.title}</h3>
          <p className="mt-1.5 text-slate-600">{head.body}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Cell
          icon={Layers}
          label="Original Resolution"
          value={`${formatNumber(project.imageWidth)} × ${formatNumber(project.imageHeight)} px`}
        />
        <Cell
          icon={Maximize2}
          label="Selected Print Size"
          value={`${project.printWidth} × ${project.printHeight} ${u}`}
        />
        <Cell
          icon={Target}
          label="Target Print PPI"
          value={`${project.targetPPI} PPI`}
          sub="Recommended target"
        />
        <Cell
          icon={Layers}
          label="Target Output Resolution"
          value={`${formatNumber(project.requiredPixelWidth)} × ${formatNumber(project.requiredPixelHeight)} px`}
          accent
        />
        <Cell
          icon={ArrowUpRight}
          label="Enlargement Required"
          value={`${project.requiredEnlargement}×`}
          accent
        />
        <Cell
          icon={Gauge}
          label="Aspect Ratio"
          value={aspect ? (aspect.match ? "Compatible" : "Mismatch") : "—"}
          sub={aspect ? `Image ${aspect.imageLabel} · Print ${aspect.printLabel}` : undefined}
        />
      </div>

      {/* Aspect-ratio mismatch chooser */}
      {aspect && !aspect.match && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-5" data-testid="aspect-mismatch">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-amber-800">Aspect ratios don't match</div>
              <p className="mt-1 text-sm text-amber-800/90">
                Your image is <span className="font-mono font-semibold">{aspect.imageLabel}</span> but the print is{" "}
                <span className="font-mono font-semibold">{aspect.printLabel}</span>. To avoid stretching, choose how
                to fit your image.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FIT_OPTIONS.map((o) => {
              const active = fitMode === o.value && o.value !== "change_size";
              return (
                <button
                  key={o.value}
                  onClick={() => (o.value === "change_size" ? onChangeSize?.() : onFitMode?.(o.value))}
                  className={[
                    "text-left rounded-lg border p-4 transition-colors duration-200 bg-white",
                    active ? "border-sky-600 border-2" : "border-slate-200 hover:border-sky-300",
                  ].join(" ")}
                  data-testid={`fit-option-${o.value}`}
                >
                  <div
                    className={[
                      "h-9 w-9 rounded-lg flex items-center justify-center mb-2",
                      active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    <o.icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{o.label}</div>
                  <div className="mt-0.5 text-xs text-slate-500 leading-snug">{o.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Secondary, non-blocking fine-detail advisory (extreme cases only) */}
      {meta.note && (
        <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
          <p>{meta.note}</p>
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
        <p>Resolution targets depend on the final print size and expected viewing distance. Values shown are recommended targets, not absolute printing rules.</p>
      </div>
    </div>
  );
};
