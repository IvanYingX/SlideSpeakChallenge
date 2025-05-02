from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
import asyncio
from app.services.document_processor import process_document, get_document_status
from app.models.schemas import ProgressUpdate
from app.utils.json_safe import json_safe
import hashlib
from app.state.document_store import document_store

router = APIRouter(tags=["documents"])
progress_listeners = {}

def compute_file_hash(file_content: bytes) -> str:
    """
    Compute a hash of the file content
    """
    return hashlib.sha256(file_content).hexdigest()

@router.post("/api/documents")
async def upload_document(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Upload a document for processing
    """
    try:
        # Throw an error if the file is not a PDF, DOCX, or TXT
        if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]:
            raise HTTPException(status_code=400, detail={"error": "File must be a PDF, DOCX, or TXT"})

        file_content = await file.read()
        document_id = compute_file_hash(file_content)

        entry = document_store.get(document_id)
        if entry:
            if entry.get("status") == "complete":
                return {
                    "document_id": document_id,
                    "status": "complete"
                }
            if entry.get("status") == "processing":
                return {
                    "document_id": document_id,
                    "status": "processing"
                }

        async def progress_callback(update: ProgressUpdate):
            if document_id in progress_listeners:
                await progress_listeners[document_id].put(json_safe(update.model_dump()))

        background_tasks.add_task(
            process_document, file_content, file.filename, document_id, progress_callback
        )

        return {"document_id": document_id, "status": "processing"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)}) from e

@router.get("/api/documents/{document_id}")
async def get_status(document_id: str):
    try:
        return await get_document_status(document_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail={"error": e.args[0]}) from e

@router.websocket("/ws/documents/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    """
    Websocket endpoint for real-time progress updates
    """
    await websocket.accept()

    if document_id not in progress_listeners:
        progress_listeners[document_id] = asyncio.Queue()

    if document_id in document_store:
        result_entry = document_store[document_id]
        status = result_entry["status"]
        if status == "complete":
            message = "Document already processed"
            progress = 1.0
        elif status == "error":
            message = result_entry.get("error", "Previous attempt failed")
            progress = 0.0
        else:
            message = "Document is unknown"
            progress = 0.0

        await websocket.send_json(json_safe({
            "document_id": document_id,
            "status": status,
            "progress": progress,
            "message": message,
        }))

    try:
        while True:
            update = await progress_listeners[document_id].get()
            await websocket.send_json(update)
    except WebSocketDisconnect:
        progress_listeners.pop(document_id, None)
