import axios from 'axios';
import { DocumentStatus } from '../types';

// Configure API base URL - should be environment variable in production
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a document for processing
 *
 * @param file - The file to upload
 * @returns Document ID and initial status
 */
export const uploadDocument = async (file: File): Promise<DocumentStatus> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      document_id: response.data.document_id,
      status: response.data.status,
      filename: response.data.filename,
      progress: response.data.progress,
      started_at: response.data.started_at,
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    throw new Error(error.response?.data?.error ?? 'Failed to upload document');
  }
};

/**
 * Get document status and results
 *
 * @param documentId - The document ID to check
 * @returns Document status and results if available
 */
export const getDocumentStatus = async (
  documentId: string
): Promise<DocumentStatus> => {
  try {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data as DocumentStatus;
  } catch (error: any) {
    console.error('Status check failed:', error);
    throw new Error(error.response?.data?.error ?? 'Failed to get document status');
  }
};

export default api;
