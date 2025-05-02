import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import ProgressBar from '../components/ProgressBar';
import ResultsView from '../components/ResultsView';
import ErrorAlert from '../components/ErrorAlert';
import { uploadDocument, getDocumentStatus } from '../services/api';
import { useDocumentProgress } from '../hooks/useWebSocket';
import { DocumentStatus } from '../types';
import ResetButton from '../components/ResetButton';

const UploadView: React.FC = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(
    null
  );
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // Connect to WebSocket for real-time updates
  const {
    updates,
    isConnected,
    error: wsError,
  } = useDocumentProgress(documentId);

  // Handle file upload
  const handleUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadDocument(file);
      setDocumentId(response.document_id);
      setDocumentStatus(response); // this contains { document_id, status }
    } catch (error) {
      const err = error as { 
        response?: { 
          data?: { 
            detail?: { error?: string },
            error?: string 
          } 
        },
        message?: string 
      };
      
      const errorMessage =
        err.response?.data?.detail?.error ??
        err.response?.data?.error ??
        err.message ??
        'Failed to upload document. Please try again.';

      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for document status when not connected to WebSocket
  useEffect(() => {
    if (!documentId || isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await getDocumentStatus(documentId);
        setDocumentStatus(status);

        // Stop polling if processing is complete
        if (status.status === 'complete' || status.status === 'error') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling document status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [documentId, isConnected]);

  // Update status from WebSocket progress updates
  useEffect(() => {
    if (!updates || !documentStatus) return;

    setDocumentStatus((prev) => {
      if (!prev) return prev;
      setProgressMessage(updates.message ?? null);
      return {
        ...prev,
        status: updates.status,
        progress: updates.progress,
      };
    });

    // If processing is complete, fetch the full result
    if (updates.status === 'complete') {
      getDocumentStatus(updates.document_id)
        .then((status) => setDocumentStatus(status))
        .catch((err) => console.error('Error fetching final result:', err));
    }
  }, [updates]);

  // Reset the app
  const handleReset = () => {
    setDocumentId(null);
    setDocumentStatus(null);
    setError(null);
  };

  // In case the analysis fails, the user can retry with the same file
  const handleRetry = async () => {
    if (!uploadedFile) return;
  
    // Clear error/status and try again
    setError(null);
    setDocumentStatus(null);
    setDocumentId(null);
  
    await handleUpload(uploadedFile);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        {(error || wsError) && (
          <div className="mb-6">
            <ErrorAlert
              message={error || wsError || 'An error occurred'}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          {!documentId ? (
            // Upload screen
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Upload a Document for Analysis
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Our AI will analyze your document and extract key insights
              </p>

              <FileUpload onUpload={handleUpload} isLoading={isUploading} />
            </div>
          ) : (
            // Processing/Results screen
            <div className="space-y-8">
              {documentStatus && documentStatus.status !== 'complete' ? (
                // Show progress during processing
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Analyzing your document
                  </h2>

                  <ProgressBar
                    progress={documentStatus.progress}
                    status={documentStatus.status}
                    isConnected={isConnected}
                    message={progressMessage}
                    handleReset={handleReset}
                    handleRetry={handleRetry}
                  />
                  {documentStatus.status !== 'error' && (
                    <p className="text-sm text-gray-500 text-center mt-6">
                      This may take a minute depending on document size
                    </p>
                  )}
                </div>
              ) : null}

              {documentStatus?.result && (
                // Show results when complete
                <div>
                  <ResultsView result={documentStatus.result} />
                  <ResetButton handleReset={handleReset} />
                </div>
              )}
            </div>
          )}
        </div>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            AI Presentation Analyzer Challenge
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UploadView;
