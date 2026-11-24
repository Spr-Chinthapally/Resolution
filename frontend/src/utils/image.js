/** Browser image helpers: read metadata + generate a visible enhanced preview. */

export function readImageMeta(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, objectUrl: url });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be read"));
    };
    img.src = url;
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sharpen(ctx, w, h, amount) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const k = amount;
  const kernel = [0, -k, 0, -k, 1 + 4 * k, -k, 0, -k, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const off = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const p = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += s[p] * kernel[ki++];
          }
        }
        d[off + c] = Math.max(0, Math.min(255, sum));
      }
      d[off + 3] = s[off + 3];
    }
  }
  // copy borders
  for (let i = 0; i < s.length; i++) {
    if (d[i] === 0 && i % 4 === 3) d[i] = s[i];
  }
  ctx.putImageData(dst, 0, 0);
}

/**
 * Generate a visibly enhanced preview from the source image.
 * The demo does NOT run a real ML upscaler — it applies bicubic-style upscaling
 * plus a light sharpen so the before/after comparison shows a real difference.
 * Output is capped to keep the browser responsive.
 */
export async function generateEnhancedPreview(src, { scale = 2, mode = "print_accurate" } = {}) {
  const img = await loadImage(src);
  const MAX_DIM = 2600;
  let targetW = Math.round(img.naturalWidth * scale);
  let targetH = Math.round(img.naturalHeight * scale);
  const longest = Math.max(targetW, targetH);
  if (longest > MAX_DIM) {
    const r = MAX_DIM / longest;
    targetW = Math.round(targetW * r);
    targetH = Math.round(targetH * r);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const amount = mode === "ai_artwork" ? 0.55 : 0.32;
  try {
    sharpen(ctx, targetW, targetH, amount);
  } catch (e) {
    // getImageData can fail on tainted canvas; degrade gracefully
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve({ blobUrl: URL.createObjectURL(blob), width: targetW, height: targetH, blob }),
      "image/png"
    );
  });
}

export async function generatePrintPng(src, { width, height, fitMode }) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new Error("The requested PNG dimensions are invalid.");
  }

  // Bound the RGBA canvas allocation before the browser attempts to render it.
  const maxEdge = 16384;
  const maxPixels = 32_000_000;
  if (Math.max(width, height) > maxEdge || width * height > maxPixels) {
    throw new Error("This PNG is too large to export. The limit is 16,384 pixels per edge and 32 megapixels. Reduce the print size or select a lower target PPI.");
  }

  const img = await loadImage(src).catch(() => {
    throw new Error("The original image could not be loaded for PNG export.");
  });
  const canvas = document.createElement("canvas");
  try {
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width !== width || canvas.height !== height) {
      throw new Error("Canvas dimensions unavailable");
    }

    const scaleX = width / img.naturalWidth;
    const scaleY = height / img.naturalHeight;
    const scale = fitMode === "crop_fill" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob || !blob.size || blob.type !== "image/png") {
      throw new Error("PNG encoding failed");
    }
    return blob;
  } catch {
    throw new Error("The browser could not render a PNG at the requested size. Try a smaller print size or a lower target PPI.");
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function downloadBlobUrl(blobUrl, filename) {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
