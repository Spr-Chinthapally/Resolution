import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

const ACCEPT = ["jpg", "jpeg", "png", "webp"];

export const UploadZone = ({ onFile, uploading, maxSizeMB = 25, error }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      if (!files || !files.length) return;
      onFile(files[0]);
    },
    [onFile]
  );

  return (
    <div
      className={[
        "relative rounded-2xl border-2 border-dashed transition-colors duration-200 cursor-pointer",
        "flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24",
        dragging ? "border-sky-600 bg-sky-50" : "border-slate-300 bg-white hover:border-sky-400 hover:bg-slate-50",
      ].join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      data-testid="upload-zone"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="upload-input"
      />

      <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-6">
        {uploading ? (
          <Loader2 className="h-7 w-7 text-sky-600 animate-spin" />
        ) : (
          <UploadCloud className="h-7 w-7 text-sky-600" strokeWidth={1.8} />
        )}
      </div>

      <h3 className="font-heading text-xl sm:text-2xl font-semibold text-slate-900">
        {uploading ? "Uploading your image…" : "Upload Your Image"}
      </h3>
      <p className="mt-2 text-base text-slate-500 max-w-md">
        Drag and drop your image here or browse your computer.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {ACCEPT.map((f) => (
          <span
            key={f}
            className="text-xs font-mono uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-1"
          >
            {f}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">Maximum file size {maxSizeMB} MB</p>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" data-testid="upload-error">
          {error}
        </p>
      )}
    </div>
  );
};
