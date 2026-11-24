"""Image-enhancement service layer.

This module is the single integration point between LargePrint AI and the
external AI image-processing backend (Python/FastAPI/Real-ESRGAN/GPU) that will
be built separately.

Request contract (conceptual):
    POST {EXTERNAL_AI_API_URL}/enhance
    {
        "image": "<url or reference>",
        "projectId": "...",
        "targetWidth": 12000,
        "targetHeight": 6000,
        "targetPPI": 50,
        "enhancementMode": "print_accurate" | "ai_artwork",
        "printType": "billboard"
    }

Response contract:
    {
        "jobId": "...",
        "status": "completed",
        "outputImageUrl": "...",
        "outputWidth": 12000,
        "outputHeight": 6000,
        "completedAt": "<iso8601>"
    }

If EXTERNAL_AI_API_URL is not configured, a mock response is returned so the
complete application workflow can be tested before the AI service is ready.
"""
import os
import uuid
from datetime import datetime, timezone

import requests


def _api_url() -> str:
    return (os.environ.get("AI_PROCESSING_API_URL") or os.environ.get("EXTERNAL_AI_API_URL") or "").strip()


def is_mock() -> bool:
    """Mock is used when explicitly flagged or when no external API URL is set."""
    flag = os.environ.get("USE_MOCK_ENHANCEMENT", "true").strip().lower()
    if flag in ("false", "0", "no"):
        return not _api_url()  # real service requested — only real if URL present
    return True if flag in ("true", "1", "yes") else (not _api_url())


def enhance_image(payload: dict) -> dict:
    """Send an enhancement request to the external AI service or return a mock."""
    if is_mock():
        return _mock_enhance(payload)
    return _remote_enhance(payload)


def _remote_enhance(payload: dict) -> dict:
    resp = requests.post(f"{_api_url().rstrip('/')}/enhance", json=payload, timeout=300)
    resp.raise_for_status()
    return resp.json()


def _mock_enhance(payload: dict) -> dict:
    """Mock response mirroring the real external-service contract.

    We do NOT run any ML model here and must stay HONEST: the mock service does
    not produce a genuine super-resolution file, so it does NOT claim the target
    dimensions as the actual output. The client renders a browser-side demo
    preview and reports that preview's REAL pixel dimensions as the actual
    output. When the real service is connected, outputWidth/outputHeight will
    carry the true processed-image dimensions.
    """
    return {
        "jobId": f"mock_{uuid.uuid4().hex[:12]}",
        "status": "completed",
        "outputImageUrl": payload.get("image"),
        "outputWidth": None,
        "outputHeight": None,
        "outputFormat": "png",
        "completedAt": datetime.now(timezone.utc).isoformat(),
        "mock": True,
    }
