import React from "react";
import { RefreshCw, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, megapixels, formatNumber } from "@/utils/format";

const Metric = ({ label, value }) => (
  <div>
    <div className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{value}</div>
  </div>
);

export const ImagePreview = ({ project, onReplace }) => {
  const src = project.localPreviewUrl;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" data-testid="image-preview">
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center min-h-[280px]">
          {src ? (
            <img src={src} alt={project.filename} className="max-h-[440px] w-full object-contain" />
          ) : (
            <ImageIcon className="h-10 w-10 text-slate-300" />
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col">
        <div className="rounded-xl border border-slate-200 bg-white p-6 flex-1">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500">Original Image</div>
          <div className="mt-1 text-lg font-semibold text-slate-900 truncate" title={project.filename}>
            {project.filename}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5">
            <Metric label="Dimensions" value={`${formatNumber(project.imageWidth)} × ${formatNumber(project.imageHeight)} px`} />
            <Metric label="Megapixels" value={`${megapixels(project.imageWidth, project.imageHeight)} MP`} />
            <Metric label="File Size" value={formatBytes(project.fileSize)} />
            <Metric label="Format" value={project.imageFormat} />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onReplace}
          className="mt-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
          data-testid="replace-image-btn"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Replace Image
        </Button>
      </div>
    </div>
  );
};
