from fastapi import APIRouter
from app.state.document_store import document_store
from app.models.schemas import AnalysisResult

router = APIRouter(tags=["dashboard"])

@router.get("/api/dashboard/stats")
async def get_system_stats():
    """
    Get system stats
    """
    total_docs = len(document_store)
    completed = sum(1 for d in document_store.values() if d["status"] == "complete")
    errored = sum(1 for d in document_store.values() if d["status"] == "error")
    avg_time = 0.0
    durations = []

    for doc in document_store.values():
        result: AnalysisResult = doc["result"]
        if result and result.processing_time_seconds:
            durations.append(result.processing_time_seconds)

    if durations:
        avg_time = sum(durations) / len(durations)

    return {
        "total_documents": total_docs,
        "completed": completed,
        "errors": errored,
        "average_processing_time": round(avg_time, 2)
    }

@router.get("/api/dashboard/documents")
async def list_documents():
    """
    List all documents
    """
    return [
        {
            "document_id": doc_id,
            "status": entry["status"],
            "filename": entry["result"].filename,
            "completed_at": entry["completed_at"]
        }
        for doc_id, entry in document_store.items()
    ]
