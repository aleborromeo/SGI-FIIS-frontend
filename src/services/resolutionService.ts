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
};
