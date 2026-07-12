import { fetchApi } from './api';

// ── Tipos de criterio y dictamen ──────────────────────────────────────────────

export type Dictamen = 'APROBADO' | 'APROBADO_CON_OBSERVACIONES' | 'DESAPROBADO';

export interface EvaluationCriterion {
  id: number;
  name: string;
  description?: string;
  maxScore: number;
  weight?: number;
}

export interface EvaluationCriterionScore {
  criterionId: number;
  criterionName: string;
  score: number;
  maxScore: number;
  observations?: string;
}

export interface EvaluationFormPayload {
  /** ID del evaluador que envía */
  evaluatorId: number;
  /** Puntajes por criterio */
  criteriaScores: EvaluationCriterionScore[];
  /** Puntaje total calculado automáticamente */
  totalScore: number;
  /** Observaciones generales */
  observations: string;
  /** Recomendaciones del evaluador */
  recommendations: string;
  /** Dictamen final */
  dictamen: Dictamen;
}

export interface EvaluacionResultRequest {
  idEvaluador: number;
  resultado: string; // "APROBADO", "OBSERVADO", "RECHAZADO"
  puntaje: number;
  observaciones: string;
}

// ── Información técnica anónima de un expediente ─────────────────────────────

export interface AnonymousProjectDetail {
  /** Código del expediente (nunca nombre del investigador) */
  expedienteCode: string;
  convocatoria: string;
  titulo: string;
  resumen: string;
  objetivoGeneral: string;
  objetivosEspecificos: string[];
  presupuestoTotal?: number;
  duracionMeses?: number;
  cronograma?: CronogramaItem[];
  documentos?: DocumentoAdjunto[];
  criterios: EvaluationCriterion[];
}

export interface CronogramaItem {
  actividad: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface DocumentoAdjunto {
  nombre: string;
  tipo: string;
  url: string;
}

// ── EvaluationItem (bandeja del evaluador) ───────────────────────────────────

export interface EvaluationItem {
  id?: string | number;
  evaluationId?: string | number;
  idEvaluacion?: string | number;

  expedienteCode?: string;

  convocatoria?: string;
  convocatoriaName?: string;

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
  tipo?: string;
  assignDate?: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const evaluacionService = {
  /**
   * Asigna un evaluador a un proyecto o plan de tesis.
   * Solo uno de idProyecto o idPlanTesis debe ser no nulo.
   */
  assignReviewer: async (
    idProyecto: number | null,
    idPlanTesis: number | null,
    idEvaluador: number
  ): Promise<void> => {
    return fetchApi('/evaluaciones/asignar', {
      method: 'POST',
      body: JSON.stringify({ idProyecto, idPlanTesis, idEvaluador }),
    });
  },

  /**
   * Asigna múltiples evaluadores a un proyecto a la vez.
   */
  assignReviewers: async (
    projectId: string | number,
    reviewerIds: number[]
  ): Promise<void> => {
    return fetchApi<void>('/evaluaciones/asignar-multiple', {
      method: 'POST',
      body: JSON.stringify({ projectId, reviewerIds }),
    });
  },

  /**
   * Envía el resultado de una evaluación (flujo legado de puntaje único).
   */
  submitResult: async (
    evaluacionId: string | number,
    payload: EvaluacionResultRequest
  ): Promise<void> => {
    return fetchApi<void>(`/evaluaciones/${evaluacionId}/resultado`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Envía el formulario completo de evaluación con criterios y dictamen.
   */
  submitEvaluationForm: async (
    evaluacionId: string | number,
    payload: EvaluationFormPayload
  ): Promise<void> => {
    return fetchApi<void>(`/evaluaciones/${evaluacionId}/evaluar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Obtiene todas las evaluaciones asignadas a un evaluador.
   * El resultado NO incluye datos del investigador (anonimato).
   */
  getByEvaluator: async (
    evaluatorId: string | number
  ): Promise<EvaluationItem[]> => {
    return fetchApi<EvaluationItem[]>(`/evaluaciones/evaluador/${evaluatorId}`);
  },

  /**
   * Obtiene el detalle anónimo de un expediente para el formulario de evaluación.
   */
  getAnonymousDetail: async (
    evaluacionId: string | number
  ): Promise<AnonymousProjectDetail> => {
    return fetchApi<AnonymousProjectDetail>(`/evaluaciones/${evaluacionId}/detalle-anonimo`);
  },

  getById: async (
    evaluacionId: string | number
  ): Promise<EvaluationItem> => {
    return fetchApi<EvaluationItem>(`/evaluaciones/${evaluacionId}`);
  },
};