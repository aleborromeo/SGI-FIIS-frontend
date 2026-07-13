import { api, fetchApi } from './api';

export interface Document {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedBy?: number;
  uploadedAt?: string;
  active?: boolean;
}

export interface DocumentUploadResponse {
  id: number;
  fileName: string;
  fileUrl: string;
}

export const documentService = {
  list: async (): Promise<Document[]> => {
    const res = await api.get<Document[]>('/api/documents');
    return Array.isArray(res) ? res : [];
  },

  upload: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<DocumentUploadResponse>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  download: (documentId: number): string => {
    const baseUrl = import.meta.env.VITE_API_URL ?? '';
    return `${baseUrl}/api/documents/download/${documentId}`;
  },

  deactivate: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/documents/deactivate/${id}`, {
      method: 'DELETE',
    });
  },
};
