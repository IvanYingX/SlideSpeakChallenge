from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from app.models.errors import DocumentProcessingError

def setup_exception_handlers(app):
    """
    Configure exception handlers for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    @app.exception_handler(DocumentProcessingError)
    async def document_error_handler(_, exc: DocumentProcessingError):
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)}
        )

    @app.exception_handler(KeyError)
    async def key_error_handler(_, exc: KeyError):
        return JSONResponse(
            status_code=404,
            content={"error": exc.args[0]}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_, exc: RequestValidationError):
        return JSONResponse(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": "Validation error", "details": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(_, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": "An unexpected error occurred", "details": str(exc)},
        )
