import { fetchApi } from './api';

export interface EvaluacionResultRequest {
  scores: Record<string, number>;
  comments: string;
  verdict: string;
}

export interface EvaluationItem {
  id?: string | number;
  evaluationId?: string | number;
  idEvaluacion?: string | number;

  projectId?: string | number;
  idProyecto?: string | number;

  thesisPlanId?: string | number;
  idPlanTesis?: string | number;

  evaluatorId?: string | number;
  idEvaluador?: string | number;

  type?: string;
  tipo?: string;

  title?: string;
  titulo?: string;
  projectTitle?: string;
  thesisTitle?: string;

  dateAssigned?: string;
  fechaAsignacion?: string;
  assignedAt?: string;

  deadline?: string;
  fechaLimite?: string;
  dueDate?: string;

  status?: string;
  estado?: string;

  result?: string;
  resultado?: string;

  score?: number;
  puntaje?: number;

  comments?: string;
  observaciones?: string;
}

export const evaluacionService = {
  assignReviewers: async (
    projectId: string | number,
    reviewerIds: number[]
  ): Promise<void> => {
    return fetchApi<void>('/evaluaciones/asignar', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        reviewerIds,
      }),
    });
  },

  submitResult: async (
    evaluacionId: string | number,
    payload: EvaluacionResultRequest
  ): Promise<void> => {
    return fetchApi<void>(`/evaluaciones/${evaluacionId}/resultado`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getByEvaluator: async (
    evaluatorId: string | number
  ): Promise<EvaluationItem[]> => {
    return fetchApi<EvaluationItem[]>(`/evaluaciones/evaluador/${evaluatorId}`);
  },

  getById: async (
    evaluacionId: string | number
  ): Promise<EvaluationItem> => {
    return fetchApi<EvaluationItem>(`/evaluaciones/${evaluacionId}`);
  },
};