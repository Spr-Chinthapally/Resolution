export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function megapixels(w, h) {
  return ((w * h) / 1_000_000).toFixed(1);
}

export function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function unitLabel(unit) {
  return { in: "in", ft: "ft", cm: "cm", m: "m" }[unit] || unit;
}

export function unitLabelLong(unit) {
  return { in: "Inches", ft: "Feet", cm: "Centimeters", m: "Meters" }[unit] || unit;
}
