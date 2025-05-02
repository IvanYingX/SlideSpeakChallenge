import axios from 'axios';
import { DashboardStats, DocumentEntry, DocumentStatus } from '../types';

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
    throw new Error(error.response?.data?.detail?.error ?? 'Failed to upload document');
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

/**
 * Get dashboard stats
 *
 * @returns Dashboard stats
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data as DashboardStats;
  } catch (error: any) {
    console.error('Dashboard stats fetch failed:', error);
    throw new Error(error.response?.data?.error ?? 'Failed to fetch dashboard stats');
  }
};

/**
 * Get all documents
 *
 * @returns All documents
 */
export const getDocuments = async (): Promise<DocumentEntry[]> => {
  try {
    const response = await api.get('/api/dashboard/documents');
    return response.data as DocumentEntry[];
  } catch (error: any) {
    console.error('Documents fetch failed:', error);
    throw new Error(error.response?.data?.error ?? 'Failed to fetch documents');
  }
};

export default api;