import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Wand2, Maximize, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ProgressStepper } from "@/components/ProgressStepper";
import { UploadZone } from "@/components/UploadZone";
import { ImagePreview } from "@/components/ImagePreview";
import { PrintTypeSelector } from "@/components/PrintTypeSelector";
import { PrintSizeForm } from "@/components/PrintSizeForm";
import { ViewingDistanceSelector } from "@/components/ViewingDistanceSelector";
import { ResolutionAnalysis } from "@/components/ResolutionAnalysis";
import { EnhancementModeSelector } from "@/components/EnhancementModeSelector";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PrintReadinessCard } from "@/components/PrintReadinessCard";
import { DownloadPanel } from "@/components/DownloadPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useProject } from "@/state/ProjectContext";
import { fetchConfig, uploadImage, createProject } from "@/services/api";
import { requestEnhancement, PROCESSING_STAGES } from "@/services/imageEnhancementService";
import { computeAnalysis, aspectInfo } from "@/utils/printCalc";
import { readImageMeta, generateEnhancedPreview, generatePrintPng, downloadBlobUrl } from "@/utils/image";
import { formatNumber, unitLabel } from "@/utils/format";

// Extract a clean, user-safe message — never raw upstream HTML/stack traces.
const safeDetail = (e, fallback) => {
  const d = e?.response?.data?.detail;
  return typeof d === "string" && d.length < 160 ? d : fallback;
};

const FALLBACK_CONFIG = {
  printTypes: [
    { value: "billboard", label: "Billboard", desc: "Roadside & highway advertising" },
    { value: "banner", label: "Banner", desc: "Vinyl banners & hanging displays" },
    { value: "poster", label: "Poster", desc: "Indoor & retail posters" },
    { value: "sign", label: "Sign", desc: "Storefront & wayfinding signage" },
    { value: "trade_show", label: "Trade Show Display", desc: "Booths & backdrops" },
    { value: "custom", label: "Custom", desc: "Any other large-format print" },
  ],
  units: [
    { value: "in", label: "Inches" },
    { value: "ft", label: "Feet" },
    { value: "cm", label: "Centimeters" },
    { value: "m", label: "Meters" },
  ],
  viewingDistances: [
    { value: "auto", label: "Auto Recommended" },
    { value: "close", label: "Close", hint: "Viewed within ~3 ft" },
    { value: "medium", label: "Medium", hint: "Viewed ~3-10 ft" },
    { value: "far", label: "Far", hint: "Viewed from >10 ft" },
  ],
  viewingDistancePPI: { close: 150, medium: 100, far: 50 },
  printTypeDefaultDistance: { billboard: "far", banner: "medium", poster: "close", sign: "medium", trade_show: "medium", custom: "medium" },
  unitToInches: { in: 1, ft: 12, cm: 0.393701, m: 39.3701 },
  enhancementModes: [
    { value: "print_accurate", label: "Print Accurate", desc: "Enhance resolution while preserving the original composition, colors, edges, and visual appearance." },
    { value: "ai_artwork", label: "AI Artwork", desc: "Enhanced processing for AI-generated artwork and digital illustrations, with greater emphasis on textures, edges, and fine details." },
  ],
  maxFileSizeMB: 25,
  supportedFormats: ["jpg", "jpeg", "png", "webp"],
  mockEnhancement: true,
};

const STEP_HEADINGS = {
  1: { title: "Upload Your Image", sub: "Start by adding the photo or artwork you want to print." },
  2: { title: "What Are You Printing?", sub: "Choose a print type and enter your final physical size." },
  3: { title: "Print Analysis", sub: "Here's the resolution required for your selected print size." },
  4: { title: "Choose Enhancement Mode", sub: "Select how you'd like your image prepared for print." },
  5: { title: "Your Print-Ready Result", sub: "Compare the original and enhanced versions, then download." },
};

export default function WorkflowPage() {
  const navigate = useNavigate();
  const { project, update, reset } = useProject();
  const [config, setConfig] = useState(FALLBACK_CONFIG);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [enhanceError, setEnhanceError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [zoom, setZoom] = useState("fit");
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(() => setConfig(FALLBACK_CONFIG));
    return () => clearInterval(intervalRef.current);
  }, []);

  // Live analysis for step 3 display
  const liveAnalysis = useMemo(() => {
    const w = parseFloat(project.printWidth);
    const h = parseFloat(project.printHeight);
    if (!project.imageWidth || !w || !h || w <= 0 || h <= 0) return null;
    return computeAnalysis(config, {
      imageWidth: project.imageWidth,
      imageHeight: project.imageHeight,
      printWidth: w,
      printHeight: h,
      printUnit: project.printUnit,
      printType: project.printType,
      viewingDistance: project.viewingDistance,
    });
  }, [config, project.imageWidth, project.imageHeight, project.printWidth, project.printHeight, project.printUnit, project.printType, project.viewingDistance]);

  const analyzedProject = useMemo(() => ({ ...project, ...(liveAnalysis || {}) }), [project, liveAnalysis]);

  const aspect = useMemo(
    () => aspectInfo(project.imageWidth, project.imageHeight, parseFloat(project.printWidth), parseFloat(project.printHeight)),
    [project.imageWidth, project.imageHeight, project.printWidth, project.printHeight]
  );

  // Keep fit mode in sync with aspect-ratio compatibility.
  // Compatible → "native" (no cropping). Mismatch → require an explicit choice.
  useEffect(() => {
    if (aspect && !aspect.match) {
      update({
        aspectRatioStatus: "mismatch",
        fitMode: project.fitMode === "crop_fill" || project.fitMode === "fit_entire" ? project.fitMode : null,
      });
    } else {
      update({ aspectRatioStatus: aspect ? "compatible" : null, fitMode: "native" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect, update]);

  const mockEnhancement = config.mockEnhancement !== false;

  // ---- Step 1: upload ----
  const handleFile = async (file) => {
    setUploadError(null);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!config.supportedFormats.includes(ext)) {
      setUploadError("Unsupported file type. Please use JPG, PNG or WEBP.");
      return;
    }
    if (file.size > config.maxFileSizeMB * 1024 * 1024) {
      setUploadError(`File too large. Maximum ${config.maxFileSizeMB} MB.`);
      return;
    }
    setUploading(true);
    try {
      const meta = await readImageMeta(file);
      const res = await uploadImage(file, meta.width, meta.height);
      update({
        uploadedFile: file,
        localPreviewUrl: meta.objectUrl,
        fileId: res.fileId,
        uploadedImageUrl: res.uploadedImageUrl,
        filename: res.filename,
        fileSize: res.fileSize,
        imageWidth: res.imageWidth,
        imageHeight: res.imageHeight,
        imageFormat: res.imageFormat,
      });
      toast.success("Image uploaded");
    } catch (e) {
      setUploadError(safeDetail(e, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const validateSize = () => {
    const next = {};
    const w = parseFloat(project.printWidth);
    const h = parseFloat(project.printHeight);
    if (!project.printWidth || isNaN(w) || w <= 0) next.width = "Enter a valid width greater than zero.";
    if (!project.printHeight || isNaN(h) || h <= 0) next.height = "Enter a valid height greater than zero.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (step === 2 && !validateSize()) return;
    if (step === 3 && aspect && !aspect.match && !project.fitMode) {
      toast.error("Choose how to fit your image before continuing.");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // ---- Step 4: enhance ----
  const runEnhance = async () => {
    setEnhanceError(null);
    setDownloadError(null);
    setProcessing(true);
    setStageIndex(0);

    // simulate visible stage progression
    intervalRef.current = setInterval(() => {
      setStageIndex((i) => (i < PROCESSING_STAGES.length - 2 ? i + 1 : i));
    }, 650);

    try {
      const proj = await createProject({
        uploadedImageUrl: project.uploadedImageUrl,
        filename: project.filename,
        fileSize: project.fileSize,
        imageWidth: project.imageWidth,
        imageHeight: project.imageHeight,
        imageFormat: project.imageFormat,
        printType: project.printType,
        printWidth: parseFloat(project.printWidth),
        printHeight: parseFloat(project.printHeight),
        printUnit: project.printUnit,
        viewingDistance: project.viewingDistance,
        fitMode: project.fitMode,
      });

      const enhanced = await requestEnhancement(proj.id, project.enhancementMode);

      // Browser-side DEMO preview (mock only). Capped for performance — its REAL
      // rendered dimensions are the honest "actual output" for the demo.
      const preview = await generateEnhancedPreview(project.localPreviewUrl, {
        scale: Math.max(1.4, proj.requiredEnlargement || 2),
        mode: project.enhancementMode,
      });

      clearInterval(intervalRef.current);
      setStageIndex(PROCESSING_STAGES.length - 1);

      // Actual output: from the real service when connected, otherwise from the
      // demo preview's true pixel dimensions. Never the requested target.
      const actualW = enhanced.actualOutputWidth ?? preview.width;
      const actualH = enhanced.actualOutputHeight ?? preview.height;

      update({
        projectId: proj.id,
        targetPPI: proj.targetPPI,
        effectivePPI: proj.effectivePPI,
        requiredPixelWidth: proj.requiredPixelWidth,
        requiredPixelHeight: proj.requiredPixelHeight,
        requiredEnlargement: proj.requiredEnlargement,
        sourceQuality: proj.sourceQuality,
        processingStatus: enhanced.processingStatus || "completed",
        jobId: enhanced.jobId,
        mock: enhanced.mock !== false && mockEnhancement,
        enhancedImageUrl: enhanced.enhancedImageUrl,
        enhancedPreviewUrl: preview.blobUrl,
        targetOutputWidth: proj.requiredPixelWidth,
        targetOutputHeight: proj.requiredPixelHeight,
        actualOutputWidth: actualW,
        actualOutputHeight: actualH,
        outputFormat: enhanced.outputFormat || "png",
      });

      setTimeout(() => {
        setProcessing(false);
        setStep(5);
      }, 550);
    } catch (e) {
      clearInterval(intervalRef.current);
      setProcessing(false);
      setEnhanceError(safeDetail(e, "Enhancement request failed. Please try again."));
    }
  };

  const handleDownload = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      const blob = await generatePrintPng(project.localPreviewUrl, {
        width: project.requiredPixelWidth,
        height: project.requiredPixelHeight,
        fitMode: project.fitMode,
      });
      const blobUrl = URL.createObjectURL(blob);
      const base = (project.filename || "image").replace(/\.[^.]+$/, "");
      try {
        downloadBlobUrl(blobUrl, `${base}_largeprint.png`);
      } finally {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      }
      toast.success("Download started");
    } catch (error) {
      setDownloadError(error.message || "PNG export failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const startOver = () => {
    reset();
    setStep(1);
    setErrors({});
    setUploadError(null);
    setEnhanceError(null);
    setZoom("fit");
  };

  const heading = STEP_HEADINGS[step];
  const zoomValue = zoom === "fit" ? 1 : zoom === "100" ? 1.8 : 3;
  const meetsTarget =
    !!project.actualOutputWidth &&
    !!project.targetOutputWidth &&
    project.actualOutputWidth >= project.targetOutputWidth &&
    project.actualOutputHeight >= project.targetOutputHeight;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {processing ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <ProcessingProgress activeIndex={stageIndex} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Stepper */}
          <div className="max-w-3xl mx-auto mb-10">
            <ProgressStepper current={step} />
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                {heading.title}
              </h1>
              <p className="mt-2 text-slate-500">{heading.sub}</p>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="lp-fade-up">
                {project.localPreviewUrl ? (
                  <ImagePreview project={project} onReplace={() => update({ localPreviewUrl: null, uploadedImageUrl: null, filename: null })} />
                ) : (
                  <UploadZone onFile={handleFile} uploading={uploading} maxSizeMB={config.maxFileSizeMB} error={uploadError} />
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="lp-fade-up space-y-8">
                <PrintTypeSelector types={config.printTypes} value={project.printType} onChange={(v) => update({ printType: v })} />
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                  <PrintSizeForm
                    units={config.units}
                    width={project.printWidth}
                    height={project.printHeight}
                    unit={project.printUnit}
                    onChange={update}
                    errors={errors}
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                  <ViewingDistanceSelector options={config.viewingDistances} value={project.viewingDistance} onChange={(v) => update({ viewingDistance: v })} />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="lp-fade-up rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                {liveAnalysis ? (
                  <ResolutionAnalysis
                    project={analyzedProject}
                    fitMode={project.fitMode}
                    onFitMode={(v) => update({ fitMode: v })}
                    onChangeSize={() => setStep(2)}
                  />
                ) : (
                  <ErrorMessage title="Invalid print dimensions" message="Please go back and enter a valid print width and height." onRetry={goBack} />
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="lp-fade-up space-y-6">
                <EnhancementModeSelector modes={config.enhancementModes} value={project.enhancementMode} onChange={(v) => update({ enhancementMode: v })} />
                {enhanceError && <ErrorMessage title="Enhancement failed" message={enhanceError} onRetry={runEnhance} />}
                <Button
                  onClick={runEnhance}
                  className="w-full h-14 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-lg font-semibold"
                  data-testid="enhance-cta"
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {liveAnalysis
                    ? `Enhance to ${formatNumber(liveAnalysis.requiredPixelWidth)} × ${formatNumber(liveAnalysis.requiredPixelHeight)} px`
                    : "Enhance for Print"}
                </Button>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="lp-fade-up space-y-6">
                {/* Demo enhancement notice (mock only — disappears when real service is on) */}
                {project.mock && (
                  <div
                    className="rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex items-start gap-3"
                    data-testid="demo-preview-notice"
                  >
                    <FlaskConical className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Demo Enhancement Preview</div>
                      <p className="mt-0.5 text-sm text-amber-800/90">
                        AI processing service is not connected yet. This preview demonstrates the enhancement workflow only.
                      </p>
                    </div>
                  </div>
                )}

                {/* Zoom controls */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Maximize className="h-4 w-4" />
                    Drag the slider to compare
                  </div>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1" data-testid="zoom-controls">
                    {[
                      { k: "fit", label: "Fit" },
                      { k: "100", label: "100%" },
                      { k: "200", label: "200%" },
                    ].map((z) => (
                      <button
                        key={z.k}
                        onClick={() => setZoom(z.k)}
                        className={[
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                          zoom === z.k ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100",
                        ].join(" ")}
                        data-testid={`zoom-${z.k}`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                </div>

                <BeforeAfterSlider
                  originalSrc={project.localPreviewUrl}
                  enhancedSrc={project.enhancedPreviewUrl || project.localPreviewUrl}
                  zoom={zoomValue}
                />

                {/* Results info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="results-info">
                  <ResultCell label="Original Resolution" value={`${formatNumber(project.imageWidth)} × ${formatNumber(project.imageHeight)} px`} />
                  <ResultCell label="Target Output" value={`${formatNumber(project.targetOutputWidth)} × ${formatNumber(project.targetOutputHeight)} px`} accent />
                  <ResultCell label={project.mock ? "Preview Resolution" : "Enhancement Output"} value={`${formatNumber(project.actualOutputWidth)} × ${formatNumber(project.actualOutputHeight)} px`} />
                  <ResultCell label="Final Print Size" value={`${project.printWidth} × ${project.printHeight} ${unitLabel(project.printUnit)}`} />
                  <ResultCell label="Target Print PPI" value={`${project.targetPPI} PPI`} />
                  <ResultCell label="Enhancement Mode" value={project.enhancementMode === "ai_artwork" ? "AI Artwork" : "Print Accurate"} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <PrintReadinessCard project={project} mock={project.mock} meetsTarget={meetsTarget} />
                  </div>
                  <div className="lg:col-span-2">
                    <DownloadPanel onDownload={handleDownload} downloading={downloading} error={downloadError} />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 4 && (
              <div className="mt-10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={step === 1 ? () => navigate("/") : goBack}
                  className="text-slate-600 hover:text-slate-900"
                  data-testid="nav-back"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  {step === 1 ? "Home" : "Back"}
                </Button>
                <Button
                  onClick={goNext}
                  disabled={step === 1 && !project.uploadedImageUrl}
                  className="h-11 px-6 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium disabled:opacity-40"
                  data-testid="nav-continue"
                >
                  Continue
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="mt-6">
                <Button variant="ghost" onClick={goBack} className="text-slate-600 hover:text-slate-900" data-testid="nav-back">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              </div>
            )}

            {step === 5 && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={startOver} className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50" data-testid="start-over-btn">
                  Prepare Another Image
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ResultCell = ({ label, value, accent }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">{label}</div>
    <div className={`mt-1 text-base font-mono font-bold ${accent ? "text-sky-700" : "text-slate-900"}`}>{value}</div>
  </div>
);
