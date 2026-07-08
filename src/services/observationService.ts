import { fetchApi } from './api';

export interface Observation {
  id: number;
  procedureId?: string;
  type?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  remedy?: string;
  remediedAt?: string;
}

export interface RemedyRequest {
  applicantId: number;
  description: string;
  attachedDocumentId?: number;
}

export const observationService = {
  getByProcedureId: async (procedureId: string): Promise<Observation[]> => {
    return fetchApi<Observation[]>(`/api/observations/procedure/${procedureId}`);
  },

  addRemedy: async (observationId: string | number, payload: RemedyRequest): Promise<void> => {
    return fetchApi<void>(`/api/observations/${observationId}/remedy`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};