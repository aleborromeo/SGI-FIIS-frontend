import { fetchApi } from './api';

export interface EvaluacionResultRequest {
  idEvaluador: number;
  resultado: string; // "APROBADO", "OBSERVADO", "RECHAZADO"
  puntaje: number;
  observaciones: string;
}

export const evaluacionService = {
  assignReviewer: async (idProyecto: number | null, idPlanTesis: number | null, idEvaluador: number): Promise<void> => {
    return fetchApi('/evaluaciones/asignar', {
      method: 'POST',
      body: JSON.stringify({ idProyecto, idPlanTesis, idEvaluador }),
    });
  },

  assignReviewers: async (projectId: number, reviewerIds: number[]): Promise<void> => {
    await Promise.all(reviewerIds.map(id => evaluacionService.assignReviewer(projectId, null, id)));
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
