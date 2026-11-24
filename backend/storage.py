"""Emergent Object Storage helper for LargePrint AI."""
import os
import requests

APP_NAME = "largeprint-ai"

_storage_key = None


def _storage_url():
    base = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
    return base.rstrip("/") + "/objstore/api/v1/storage"


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    resp = requests.post(f"{_storage_url()}/init", json={"emergent_key": emergent_key}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    last_exc = None
    for attempt in range(3):
        key = init_storage(force=attempt > 0)
        resp = requests.put(
            f"{_storage_url()}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code in (401, 403, 404) or resp.status_code >= 500:
            last_exc = requests.HTTPError(f"{resp.status_code} {resp.text[:200]}")
            continue
        resp.raise_for_status()
        return resp.json()
    raise last_exc or requests.HTTPError("Storage upload failed")


def get_object(path: str):
    last_exc = None
    for attempt in range(3):
        key = init_storage(force=attempt > 0)
        resp = requests.get(
            f"{_storage_url()}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
        if resp.status_code == 200:
            return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
        if resp.status_code in (401, 403, 404) or resp.status_code >= 500:
            last_exc = requests.HTTPError(f"{resp.status_code} {resp.text[:200]}")
            continue
        resp.raise_for_status()
    raise last_exc or requests.HTTPError("Storage read failed")
