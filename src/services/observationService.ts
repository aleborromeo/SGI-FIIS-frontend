import { fetchApi } from './api';

export interface Observation {
  id: number;
  procedureId?: number;
  type?: string;
  description?: string;
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

  getMyObservations: async (): Promise<Observation[]> => {
    return fetchApi<Observation[]>('/api/observations/my');
  },

  addRemedy: async (observationId: string | number, payload: RemedyRequest): Promise<void> => {
    return fetchApi<void>(`/api/observations/${observationId}/remedy`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};