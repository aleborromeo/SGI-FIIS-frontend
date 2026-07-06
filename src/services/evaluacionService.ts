import { fetchApi } from './api';

export interface EvaluacionResultRequest {
  scores: Record<string, number>;
  comments: string;
  verdict: string;
}

export const evaluacionService = {
  assignReviewers: async (projectId: string, reviewerIds: number[]): Promise<void> => {
    return fetchApi('/evaluaciones/asignar', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        reviewerIds
      }),
    });
  },

  submitResult: async (evaluacionId: string | number, payload: EvaluacionResultRequest): Promise<void> => {
    return fetchApi(`/evaluaciones/${evaluacionId}/resultado`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getByEvaluator: async (evaluatorId: string | number): Promise<any[]> => {
    return fetchApi(`/evaluaciones/evaluador/${evaluatorId}`);
  },
  
  getById: async (evaluacionId: string | number): Promise<any> => {
    return fetchApi(`/evaluaciones/${evaluacionId}`);
  }
};
