import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

import print_config as cfg
import storage
from enhancement_service import enhance_image, is_mock

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="LargePrint AI")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}


# ---------- Models ----------
class ProjectCreate(BaseModel):
    uploadedImageUrl: str
    filename: str
    fileSize: int
    imageWidth: int
    imageHeight: int
    imageFormat: str
    printType: str
    printWidth: float
    printHeight: float
    printUnit: str
    viewingDistance: str = "auto"
    fitMode: Optional[str] = None


class EnhanceRequest(BaseModel):
    enhancementMode: str = "print_accurate"


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


# ---------- Config ----------
@api_router.get("/config")
async def get_config():
    return {
        "printTypes": cfg.PRINT_TYPES,
        "units": cfg.UNITS,
        "viewingDistances": cfg.VIEWING_DISTANCES,
        "viewingDistancePPI": cfg.VIEWING_DISTANCE_PPI,
        "printTypeDefaultDistance": cfg.PRINT_TYPE_DEFAULT_DISTANCE,
        "unitToInches": cfg.UNIT_TO_INCHES,
        "enhancementModes": cfg.ENHANCEMENT_MODES,
        "maxFileSizeMB": cfg.MAX_FILE_SIZE_MB,
        "supportedFormats": cfg.SUPPORTED_FORMATS,
        "mockEnhancement": is_mock(),
    }


# ---------- Upload ----------
@api_router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
):
    fname = file.filename or ""
    ext = (fname.rsplit(".", 1)[-1] if "." in fname else "").lower()
    if ext not in cfg.SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use JPG, PNG or WEBP.")

    data = await file.read()
    if len(data) > cfg.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {cfg.MAX_FILE_SIZE_MB} MB.")

    path = f"{storage.APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    try:
        result = storage.put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Upload to storage failed: {e}")
        raise HTTPException(status_code=424, detail="Upload failed. Please try again.")

    file_id = str(uuid.uuid4())
    record = {
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "width": width,
        "height": height,
        "format": ext.upper(),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(dict(record))

    return {
        "fileId": file_id,
        "uploadedImageUrl": result["path"],
        "filename": file.filename,
        "fileSize": record["size"],
        "imageWidth": width,
        "imageHeight": height,
        "imageFormat": ext.upper(),
    }


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        content, content_type = storage.get_object(path)
    except Exception as e:
        logger.error(f"Storage read failed: {e}")
        raise HTTPException(status_code=424, detail="Result unavailable")
    return Response(content=content, media_type=record.get("content_type", content_type))


# ---------- Projects ----------
@api_router.post("/projects")
async def create_project(body: ProjectCreate):
    if body.printWidth <= 0 or body.printHeight <= 0:
        raise HTTPException(status_code=400, detail="Invalid print dimensions")

    analysis = cfg.compute_analysis(
        image_width=body.imageWidth,
        image_height=body.imageHeight,
        print_width=body.printWidth,
        print_height=body.printHeight,
        print_unit=body.printUnit,
        print_type=body.printType,
        viewing_distance=body.viewingDistance,
    )

    now = datetime.now(timezone.utc).isoformat()
    project = {
        "id": str(uuid.uuid4()),
        "createdAt": now,
        "updatedAt": now,
        "status": "analyzed",
        **body.model_dump(),
        **analysis,
        "enhancementMode": None,
        "processingStatus": "uploaded",
        "enhancedImageUrl": None,
        "targetOutputWidth": None,
        "targetOutputHeight": None,
        "actualOutputWidth": None,
        "actualOutputHeight": None,
        "outputFormat": None,
        "jobId": None,
    }
    await db.projects.insert_one(dict(project))
    return _clean(project)


@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _clean(project)


@api_router.post("/projects/{project_id}/enhance")
async def enhance_project(project_id: str, body: EnhanceRequest):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if body.enhancementMode not in ("print_accurate", "ai_artwork"):
        raise HTTPException(status_code=400, detail="Invalid enhancement mode")

    payload = {
        "projectId": project_id,
        "image": project["uploadedImageUrl"],
        "targetWidth": project["requiredPixelWidth"],
        "targetHeight": project["requiredPixelHeight"],
        "targetPPI": project["targetPPI"],
        "enhancementMode": body.enhancementMode,
        "printType": project["printType"],
        "fitMode": project.get("fitMode") or "native",
    }

    try:
        result = enhance_image(payload)
    except Exception as e:
        logger.error(f"Enhancement request failed: {e}")
        await db.projects.update_one({"id": project_id}, {"$set": {"processingStatus": "failed"}})
        raise HTTPException(status_code=424, detail="Enhancement request failed")

    update = {
        "enhancementMode": body.enhancementMode,
        "processingStatus": result.get("status", "completed"),
        "enhancedImageUrl": result.get("outputImageUrl"),
        # Requested target output (what the print size + PPI require)
        "targetOutputWidth": project["requiredPixelWidth"],
        "targetOutputHeight": project["requiredPixelHeight"],
        # Actual output dimensions returned by the processing service.
        # In mock mode these are unknown server-side (the browser renders the
        # demo preview and reports its real dimensions); never faked to target.
        "actualOutputWidth": result.get("outputWidth"),
        "actualOutputHeight": result.get("outputHeight"),
        "outputFormat": result.get("outputFormat", "png"),
        "jobId": result.get("jobId"),
        "mock": bool(result.get("mock", False)),
        "status": "completed",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.update_one({"id": project_id}, {"$set": update})
    project.update(update)
    return _clean(project)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        storage.init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
