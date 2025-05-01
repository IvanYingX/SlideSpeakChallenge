"""
Document processor service - NEEDS IMPLEMENTATION

This module contains the core document processing logic.
Candidates should implement the functions below to create an efficient
document processing pipeline.
"""

from typing import List, Dict, Any, Callable, Coroutine, Optional
import time
import logging
from datetime import datetime
from app.models.schemas import ProgressUpdate, AnalysisResult, KeyInsight
from app.services.ai_service import (
    analyze_text_chunk,
    extract_key_insights,
    extract_text_from_document,
)
from app.models.errors import AIServiceError

logger = logging.getLogger(__name__)


# In-memory storage for document results
# In a real application, this would be a database
document_store: Dict[str, Any] = {}

async def chunk_document(text: str, chunk_size: int = 1000) -> List[str]:
    """
    Split document text into manageable chunks for processing

    Args:
        text: The full document text
        chunk_size: Approximate size of each chunk in characters

    Returns:
        List of text chunks
    """
    # Your implementation here
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]


async def process_document(
    file_content: bytes,
    filename: str,
    document_id: str,
    progress_callback: Callable[[ProgressUpdate], Coroutine[Any, Any, None]],
) -> AnalysisResult:
    """
    Process a document through the entire pipeline:
    1. Extract text from document
    2. Split into chunks
    3. Analyze each chunk
    4. Extract key insights
    5. Combine results

    Args:
        file_content: Raw bytes of the uploaded file
        filename: Original filename of the document
        document_id: Unique ID for the document
        progress_callback: Async function to call with progress updates

    Returns:
        AnalysisResult object with the complete analysis
    """
    # Your implementation here
    try:
        start_time = time.time()
        await progress_callback(ProgressUpdate(
            document_id=document_id,
            progress=0.0,
            status="processing",
            message="Extracting text from document",
        ))
        text = await extract_text_from_document(file_content)

        chunks = await chunk_document(text)

        analysis_results = []
        for i, chunk in enumerate(chunks):
            await progress_callback(ProgressUpdate(
                document_id=document_id,
                progress=0.1 + (i / len(chunks) * 0.7),
                status="analyzing",
                message=f"Analyzing text chunk {i + 1} of {len(chunks)}",
            ))
            analysis = await analyze_text_chunk(chunk)
            analysis_results.append(analysis)

        await progress_callback(ProgressUpdate(
            document_id=document_id,
            progress=0.8,
            status="analyzing",
            message="Extracting key insights",
        ))
        key_insights: List[KeyInsight] = []
        for analysis in analysis_results:
            insights = await extract_key_insights(analysis)
            key_insights.extend(insights)

        # Combine results
        result = AnalysisResult(
            document_id=document_id,
            filename=filename,
            word_count=len(text.split()),
            sentiment_score=analysis_results[0]["sentiment_score"],
            topics=analysis_results[0]["topics"],
            processing_time_seconds=time.time() - start_time,
            key_insights=key_insights,
        )

        document_store[document_id] = {
            "status": "complete",
            "result": result,
            "completed_at": datetime.now(),
        }

        await progress_callback(ProgressUpdate(
            document_id=document_id,
            progress=1.0,
            status="complete",
            message="Document processed successfully",
        ))

        return result
    
    except AIServiceError as e:
        error_message = str(e)
        print("Error: ", error_message)
        result = AnalysisResult(
            document_id=document_id,
            filename=filename,
            word_count=0,
            processing_time_seconds=time.time() - start_time,
            key_insights=[],
            error=error_message,
        )

        document_store[document_id] = {
            "status": "error",
            "result": result,
            "completed_at": datetime.now(),
        }

        await progress_callback(ProgressUpdate(
            document_id=document_id,
            progress=1.0,
            status="error",
            message=error_message,
        ))

        return result

    except Exception as e:
        error_message = f"Error processing document: {e}"

        result = AnalysisResult(
            document_id=document_id,
            filename=filename,
            word_count=0,
            processing_time_seconds=time.time() - start_time,
            key_insights=[],
            error=error_message,
        )

        document_store[document_id] = {
            "status": "error",
            "result": result,
            "completed_at": datetime.now(),
        }

        await progress_callback(ProgressUpdate(
            document_id=document_id,
            progress=1.0,
            status="error",
            message=error_message,
        ))

        return result


async def get_document_status(document_id: str) -> Optional[Dict[str, Any]]:
    """
    Get the current status of a document

    Args:
        document_id: The document ID to check

    Returns:
        Document status information
    """
    # Your implementation here
    if document_id not in document_store:
        raise KeyError(f"Document with ID {document_id} not found.")
    return document_store[document_id]
