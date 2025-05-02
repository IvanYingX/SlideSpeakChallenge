from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.routes import root, documents, health, dashboard
from app.utils.error_handlers import setup_exception_handlers
import uvicorn
from prometheus_fastapi_instrumentator import Instrumentator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
app = FastAPI(title="AI Document Analyzer API")

instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)
# instrumentator.instrument(app)
# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
setup_exception_handlers(app)

# Include routers
app.include_router(root.router)
app.include_router(documents.router)
app.include_router(health.router)
app.include_router(dashboard.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
