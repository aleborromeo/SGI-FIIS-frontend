import { fetchApi } from './api';

export interface DocumentResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data: any;
}

export const documentService = {
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<DocumentResponse>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  downloadDocument: async (id: number | string) => {
    const token = localStorage.getItem('sgi_token') ?? localStorage.getItem('token') ?? '';
    const res = await fetch(`/api/v1/files/download/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}`,
      },
    });
    if (!res.ok) throw new Error('Error al descargar el archivo');
    return res.blob();
  },
};
