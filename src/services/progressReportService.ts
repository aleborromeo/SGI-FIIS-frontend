import { api } from './api';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ProgressReportStatus =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'APROBADO'
  | 'RECHAZADO';

// Mapping: backend English → frontend Spanish
const STATUS_BE_TO_FE: Record<string, ProgressReportStatus> = {
  PENDING: 'PENDIENTE',
  UNDER_REVIEW: 'EN_REVISION',
  OBSERVED: 'OBSERVADO',
  APPROVED: 'APROBADO',
  REJECTED: 'RECHAZADO',
};

// Mapping: frontend Spanish → backend English
const STATUS_FE_TO_BE: Record<string, string> = {
  PENDIENTE: 'PENDING',
  EN_REVISION: 'UNDER_REVIEW',
  OBSERVADO: 'OBSERVED',
  APROBADO: 'APPROVED',
  RECHAZADO: 'REJECTED',
};

function toFrontendStatus(backendStatus: string): ProgressReportStatus {
  return STATUS_BE_TO_FE[backendStatus] ?? 'PENDIENTE';
}

function toBackendStatus(frontendStatus: string): string {
  return STATUS_FE_TO_BE[frontendStatus] ?? frontendStatus;
}

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
  attachedDocumentId?: number;
  period?: string;
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

// ── Mapper Helpers ────────────────────────────────────────────────────────────

function mapResponseToReport(r: any): ProgressReport {
  return {
    id: r.id,
    reportNumber: r.id,
    projectId: r.projectId,
    projectTitle: r.projectTitle || `Proyecto #${r.projectId}`,
    responsibleName: r.responsibleName || 'Docente Investigador',
    reportDate: r.registrationDate || r.lastUpdatedDate || '',
    physicalProgress: Number(r.progressPercentage || 0),
    financialProgress: Number(r.progressPercentage || 0), // Copied from progressPercentage for UI compatibility
    status: toFrontendStatus(r.reportStatus || r.status || 'PENDING'),
    observations: r.achievements ? `Logros: ${r.achievements}. Dificultades: ${r.difficulties}` : undefined,
    attachedDocumentId: r.attachedDocumentId,
    period: r.period,
  };
}

function mapResponseToDetail(r: any): ProgressReportDetail {
  const base = mapResponseToReport(r);
  return {
    ...base,
    executedActivities: r.executedActivities || [
      {
        id: 1,
        description: `Avance general de actividades reportadas en periodo ${r.period}`,
        startDate: r.registrationDate || '',
        endDate: r.lastUpdatedDate || '',
        completed: true
      }
    ],
    evidences: r.evidences || [],
    attachments: r.attachedDocumentId ? [{
      id: r.attachedDocumentId,
      fileName: `informe_avance_${r.id}.pdf`,
      fileType: 'pdf',
      url: `/api/documents/download/${r.attachedDocumentId}`,
      uploadedAt: r.registrationDate || ''
    }] : [],
    comments: r.observations ? [
      {
        id: 1,
        authorName: 'Sistema de Trazabilidad',
        authorRole: 'SISTEMA',
        content: `Últimas observaciones: ${r.observations}`,
        createdAt: r.lastUpdatedDate || ''
      }
    ] : [],
    changeHistory: r.changeHistory || []
  };
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const progressReportService = {
  getPendingReports: async (status?: string): Promise<ProgressReport[]> => {
    const backendStatus = status ? toBackendStatus(status) : undefined;
    const res = await api.get<any>('/api/progress-reports', {
      params: backendStatus ? { status: backendStatus } : undefined
    });
    const content = Array.isArray(res.content) ? res.content : Array.isArray(res) ? res : [];
    return content.map(mapResponseToReport);
  },

  /**
   * Obtiene los proyectos disponibles según el rol del usuario autenticado.
   * - DOCENTE_INVESTIGADOR → solo sus proyectos
   * - DIRECTOR_INVESTIGACION → todos los proyectos activos
   */
  getProjectsByRole: async (): Promise<ProjectSummary[]> => {
    return api.get<ProjectSummary[]>('/api/progress-reports');
  },

  getByProject: async (projectId: number): Promise<ProgressReport[]> => {
    const raw = await api.get<any[]>(`/api/progress-reports/project/${projectId}`);
    return raw.map(mapResponseToReport);
  },

  getDetail: async (reportId: number): Promise<ProgressReportDetail> => {
    const raw = await api.get<any>(`/api/progress-reports/${reportId}`);
    return mapResponseToDetail(raw);
  },

  createReport: async (payload: {
    projectId: number;
    reportType: 'PARCIAL' | 'FINAL';
    period: string;
    progressPercentage: number;
    achievements: string;
    difficulties: string;
    recommendations: string;
    attachedDocumentId?: number | null;
  }): Promise<ProgressReport> => {
    const raw = await api.post<any>('/api/progress-reports', payload);
    return mapResponseToReport(raw);
  },

  amendReport: async (reportId: number, payload: {
    amendmentDocumentId: number;
  }): Promise<ProgressReport> => {
    const raw = await api.patch<any>(`/api/progress-reports/${reportId}/amend`, payload);
    return mapResponseToReport(raw);
  },

  forwardReport: async (reportId: number): Promise<ProgressReport> => {
    const raw = await api.patch<any>(`/api/progress-reports/${reportId}/forward`, {});
    return mapResponseToReport(raw);
  },

  approveReport: async (reportId: number): Promise<ProgressReport> => {
    const raw = await api.patch<any>(`/api/progress-reports/${reportId}/approve`, {});
    return mapResponseToReport(raw);
  },

  observeReport: async (reportId: number, observation: string): Promise<ProgressReport> => {
    const raw = await api.patch<any>(`/api/progress-reports/${reportId}/observe`, { observation });
    return mapResponseToReport(raw);
  },

  rejectReport: async (reportId: number): Promise<ProgressReport> => {
    const raw = await api.patch<any>(`/api/progress-reports/${reportId}/reject`, {});
    return mapResponseToReport(raw);
  },
};
