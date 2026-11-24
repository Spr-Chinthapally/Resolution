import React from "react";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const FUTURE_FORMATS = ["TIFF", "JPEG", "PDF", "CMYK", "ICC Profile"];

export const DownloadPanel = ({ onDownload, downloading, error }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7" data-testid="download-panel">
      <h3 className="font-heading text-xl font-semibold text-slate-900">Download</h3>
      <p className="mt-1 text-sm text-slate-500">
        A PNG rendered from your original image at the target pixel dimensions.
      </p>

      <Button
        onClick={onDownload}
        disabled={downloading}
        className="mt-5 w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-base font-semibold"
        data-testid="download-btn"
      >
        <Download className="mr-2 h-5 w-5" />
        {downloading ? "Preparing…" : "Download PNG"}
      </Button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Coming soon</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FUTURE_FORMATS.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-2 py-1"
            >
              <Lock className="h-3 w-3" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
