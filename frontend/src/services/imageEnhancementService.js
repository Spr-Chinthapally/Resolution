/**
 * imageEnhancementService
 *
 * Dedicated integration layer between the LargePrint AI web app and the
 * external AI image-processing backend. UI components never call the enhance
 * endpoint directly — they go through this service.
 *
 * Backend proxies to the real external AI service (configured via the
 * EXTERNAL_AI_API_URL environment variable) or returns a mock response during
 * development so the full workflow is testable.
 */
import { api } from "./api";

export async function requestEnhancement(projectId, enhancementMode) {
  const { data } = await api.post(`/projects/${projectId}/enhance`, {
    enhancementMode,
  });
  return data;
}

// Ordered processing stages surfaced to the user during enhancement.
export const PROCESSING_STAGES = [
  { key: "uploaded", label: "Upload Complete" },
  { key: "queued", label: "Analyzing Image" },
  { key: "enhancing", label: "Enhancing Resolution" },
  { key: "processing", label: "Optimizing Details" },
  { key: "finalizing", label: "Preparing Final File" },
  { key: "completed", label: "Complete" },
];
