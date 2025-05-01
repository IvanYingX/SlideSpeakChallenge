from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": __import__("datetime").datetime.utcnow().isoformat()}

@router.get("/health/version")
async def version():
    return {"version": "1.0.0", "service": "AI Document Analyzer"}