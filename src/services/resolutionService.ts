import { api } from './api';
import { documentService } from './documentService';

export interface ResolutionPayload {
  procedureId: number;
  number: string;
  title: string;
  emissionDate: string;
  issuer: string;
  startDate: string;
  endDate: string;
  duration: number;
  receivesFif: boolean;
  fifStatus: string;
  requiresArticle: boolean;
  attachedDocumentId?: number;
}

export interface Resolution {
  id: number;
  procedureId: number;
  number: string;
  title: string;
  emissionDate: string;
  issuer: string;
  startDate: string;
  endDate: string;
  duration: number;
  receivesFif: boolean;
  fifStatus: string;
  requiresArticle: boolean;
  attachedDocumentId?: number;
  createdAt: string;
}

export interface ResolutionResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data: any;
}

export const resolutionService = {
  create: async (payload: ResolutionPayload): Promise<Resolution> => {
    return api.post<Resolution>('/api/v1/resolutions', payload);
  },

  getByProcedureId: async (procedureId: number): Promise<Resolution | null> => {
    try {
      return await api.get<Resolution>(`/api/v1/resolutions/procedure/${procedureId}`);
    } catch {
      return null;
    }
  },

  uploadAttachment: async (file: File): Promise<number> => {
    const result = await documentService.upload(file);
    return result.id;
  },

  issueResolution: (data: {
    numeroResolucion: string;
    fechaEmision: string;
    asunto: string;
    idTramite: number | string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('numeroResolucion', data.numeroResolucion);
    formData.append('fechaEmision', data.fechaEmision);
    formData.append('asunto', data.asunto);
    formData.append('idTramite', String(data.idTramite));
    formData.append('fileBytes', data.file);

    return api.post<ResolutionResponse>('/resolutions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
