from prometheus_client import Counter, Histogram

DOCUMENTS_PROCESSED = Counter(
    "documents_processed_total", "Total number of documents processed"
)

DOCUMENT_ERRORS = Counter(
    "document_processing_errors_total", "Total number of document processing errors"
)

PROCESSING_DURATION = Histogram(
    "document_processing_duration_seconds", "Duration of document processing in seconds"
)
