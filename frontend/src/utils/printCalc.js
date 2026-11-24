/**
 * Print-resolution calculation logic (client-side mirror of the backend).
 * Kept modular and config-driven so formulas / PPI targets can change later.
 */
import { formatNumber } from "@/utils/format";

export function resolveTargetPPI(config, printType, viewingDistance) {
  const distance =
    viewingDistance === "auto"
      ? config.printTypeDefaultDistance[printType] || "medium"
      : viewingDistance;
  return config.viewingDistancePPI[distance] ?? config.viewingDistancePPI.medium;
}

export function sourceQualityStatus(requiredEnlargement) {
  const e = requiredEnlargement;
  if (e <= 1.0) return "excellent";
  if (e <= 2.0) return "good";
  if (e <= 4.0) return "needs_enhancement";
  if (e <= 8.0) return "low_resolution";
  return "source_too_small";
}

export function computeAnalysis(config, {
  imageWidth,
  imageHeight,
  printWidth,
  printHeight,
  printUnit,
  printType,
  viewingDistance,
}) {
  const factor = config.unitToInches[printUnit] ?? 1;
  const printWIn = printWidth * factor;
  const printHIn = printHeight * factor;

  const targetPPI = resolveTargetPPI(config, printType, viewingDistance);

  const requiredPixelWidth = Math.round(printWIn * targetPPI);
  const requiredPixelHeight = Math.round(printHIn * targetPPI);

  const effPPIw = printWIn > 0 ? imageWidth / printWIn : 0;
  const effPPIh = printHIn > 0 ? imageHeight / printHIn : 0;
  const effectivePPI = Math.min(effPPIw, effPPIh);

  const widthScale = imageWidth > 0 ? requiredPixelWidth / imageWidth : 0;
  const heightScale = imageHeight > 0 ? requiredPixelHeight / imageHeight : 0;
  const requiredEnlargement = Math.max(widthScale, heightScale);

  return {
    printWidthInches: Number(printWIn.toFixed(2)),
    printHeightInches: Number(printHIn.toFixed(2)),
    targetPPI,
    effectivePPI: Number(effectivePPI.toFixed(1)),
    requiredPixelWidth,
    requiredPixelHeight,
    requiredEnlargement: Number(requiredEnlargement.toFixed(2)),
    sourceQuality: sourceQualityStatus(requiredEnlargement),
  };
}

export function gcd(a, b) {
  a = Math.round(a);
  b = Math.round(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function ratioLabel(w, h) {
  const d = gcd(w, h);
  const rw = Math.round(w / d);
  const rh = Math.round(h / d);
  // collapse very large ratios to 1 decimal form
  if (rw > 40 || rh > 40) return `${(w / h).toFixed(2)}:1`;
  return `${rw}:${rh}`;
}

export function aspectInfo(imageWidth, imageHeight, printWidth, printHeight) {
  if (!imageWidth || !imageHeight || !printWidth || !printHeight) return null;
  const imageRatio = imageWidth / imageHeight;
  const printRatio = printWidth / printHeight;
  const diffPct = Math.abs(imageRatio - printRatio) / printRatio;
  return {
    imageRatio,
    printRatio,
    imageLabel: ratioLabel(imageWidth, imageHeight),
    printLabel: ratioLabel(printWidth, printHeight),
    match: diffPct <= 0.03,
    diffPct: Number((diffPct * 100).toFixed(1)),
  };
}

export function enhancementHeadline(requiredEnlargement, targetWidth, targetHeight) {
  const dims = `${formatNumber(targetWidth)} × ${formatNumber(targetHeight)} px`;
  if (requiredEnlargement <= 1.0) {
    return {
      status: "ready",
      title: "Print Ready",
      body: `Your image already meets the target resolution (${dims}) for your selected print size.`,
    };
  }
  return {
    status: "enhance",
    title: "Enhancement Required",
    body: `Your image will be enhanced to ${dims} for your selected print size.`,
  };
}

// Enhancement-oriented quality presentation. Statuses describe how much
// enhancement is applied — not a discouraging "too low" verdict. Extreme
// enlargement carries a secondary, non-blocking fine-detail advisory only.
export const QUALITY_META = {
  excellent: {
    label: "Print Ready",
    text: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    note: "",
  },
  good: {
    label: "Light Enhancement",
    text: "#0369A1",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    note: "",
  },
  needs_enhancement: {
    label: "Enhancement Ready",
    text: "#0369A1",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    note: "",
  },
  low_resolution: {
    label: "Enhancement Ready",
    text: "#0369A1",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    note: "Large enlargement required. Extreme upscaling may reduce authentic fine-detail accuracy, but the image will be prepared to the selected target resolution.",
  },
  source_too_small: {
    label: "Maximum Enhancement",
    text: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
    note: "This is a very large enlargement. Fine detail may appear softer, though the image will be prepared to the full target resolution for this print size.",
  },
};
