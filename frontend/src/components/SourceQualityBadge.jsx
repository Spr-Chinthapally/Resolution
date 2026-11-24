import React from "react";
import { QUALITY_META } from "@/utils/printCalc";

export const SourceQualityBadge = ({ status, className = "" }) => {
  const meta = QUALITY_META[status] || QUALITY_META.needs_enhancement;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border ${className}`}
      style={{ color: meta.text, backgroundColor: meta.bg, borderColor: meta.border }}
      data-testid="source-quality-badge"
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.text }} />
      {meta.label}
    </span>
  );
};
