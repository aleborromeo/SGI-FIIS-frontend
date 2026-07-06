import { fetchApi } from './api';

export interface Observation {
  id: number;
  procedureId: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
  remedy?: string;
  remediedAt?: string;
}

export const observationService = {
  getByProcedureId: async (procedureId: string): Promise<Observation[]> => {
    return fetchApi<Observation[]>(`/observations/procedure/${procedureId}`);
  },

  addRemedy: async (observationId: string | number, remedyContent: string): Promise<void> => {
    return fetchApi(`/observations/${observationId}/remedy`, {
      method: 'POST',
      body: JSON.stringify({ content: remedyContent }),
    });
  }
};
