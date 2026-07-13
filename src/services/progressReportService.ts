import { api } from './api';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ProgressReportStatus =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'APROBADO'
  | 'RECHAZADO';

export interface ProgressReport {
  id: number;
  reportNumber: number;
  projectId: number;
  projectTitle?: string;
  responsibleName: string;
  reportDate: string;
  /** Porcentaje de avance físico (0–100), validado por chk_porcentaje */
  physicalProgress: number;
  /** Porcentaje de avance financiero (0–100) */
  financialProgress: number;
  status: ProgressReportStatus;
  observations?: string;
}

export interface ProgressReportDetail extends ProgressReport {
  executedActivities: ExecutedActivity[];
  evidences: Evidence[];
  attachments: Attachment[];
  comments: ReportComment[];
  changeHistory: ChangeHistoryEntry[];
}

export interface ExecutedActivity {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface Evidence {
  id: number;
  title: string;
  description?: string;
  url?: string;
  type: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}

export interface ReportComment {
  id: number;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface ChangeHistoryEntry {
  id: number;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface ProjectSummary {
  id: number;
  title: string;
  status: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const progressReportService = {
  /**
   * Obtiene los proyectos disponibles según el rol del usuario autenticado.
   * - DOCENTE_INVESTIGADOR → solo sus proyectos
   * - DIRECTOR_INVESTIGACION → todos los proyectos activos
   */
  getProjectsByRole: async (): Promise<ProjectSummary[]> => {
    return api.get<ProjectSummary[]>('/api/progress-reports');
  },

  getByProject: async (projectId: number): Promise<ProgressReport[]> => {
    return api.get<ProgressReport[]>(`/api/progress-reports/project/${projectId}`);
  },

  getDetail: async (reportId: number): Promise<ProgressReportDetail> => {
    return api.get<ProgressReportDetail>(`/api/progress-reports/${reportId}`);
  },
};
