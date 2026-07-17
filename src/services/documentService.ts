import { api, fetchApi } from './api';

function getAuthToken(): string | null {
  const token =
    localStorage.getItem('sgi_token') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');
  return token ? token.replace(/^Bearer\s+/i, '') : null;
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

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
  originalName: string;
  extension: string;
  sizeBytes?: number;
}

export const documentService = {
  list: async (): Promise<Document[]> => {
    const res = await api.get<any[]>('/api/documents');
    return Array.isArray(res) ? res.map(d => ({
      id: d.id,
      fileName: d.originalName || d.fileName || `documento_${d.id}`,
      fileUrl: d.fileUrl || '',
      fileType: d.extension || d.fileType || '',
      fileSize: d.sizeBytes || d.fileSize,
      uploadedBy: d.uploadedById || d.uploadedBy,
      uploadedAt: d.uploadDate || d.uploadedAt,
      active: d.active
    })) : [];
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
    return `${getBaseUrl()}/api/documents/download/${documentId}`;
  },

  downloadFile: async (documentId: number, fileName?: string): Promise<void> => {
    const token = getAuthToken();
    const url = `${getBaseUrl()}/api/documents/download/${documentId}`;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Error al descargar (${response.status})`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || `documento_${documentId}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  },

  getViewUrl: (documentId: number): string => {
    const token = getAuthToken();
    return `${getBaseUrl()}/api/documents/view/${documentId}${token ? `?token=${token}` : ''}`;
  },

  deactivate: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/documents/deactivate/${id}`, {
      method: 'DELETE',
    });
  },
};
