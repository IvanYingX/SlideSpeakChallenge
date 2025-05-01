from fastapi import APIRouter

router = APIRouter(tags=["root"])

@router.get("/")
async def root():
    return {"status": "ok", "service": "AI Document Analyzer API"}
