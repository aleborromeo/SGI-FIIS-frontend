import { fetchApi } from './api';

export interface ProjectMember {
  id?: number;
  userId: number;
  role: string;
}

export interface Project {
  id: number | string;
  code?: string;
  title?: string;
  summary?: string;
  abstract?: string;
  generalObjective?: string;
  specificObjectives?: string;
  methodology?: string;
  expectedResults?: string;
  projectType?: string;
  researchLineId?: number;
  researchLineName?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  executionPlace?: string;
  responsibleId?: number;
  researchGroupId?: number;
  researchGroupCode?: string;
  callId?: number;
  documentId?: number;
  documentName?: string;
  status?: string;
  members?: ProjectMember[];
  recibeApoyoFif?: string;

  line?: string;
  type?: string;
}

export interface CreateProjectPayload {
  title: string;
  summary: string;
  generalObjective: string;
  researchLineId?: number;
  budget?: number;
  startDate?: string;
  endDate?: string;
  executionPlace?: string;
  researchGroupId?: number;
  callId?: number;
  documentId?: number;
  members?: ProjectMember[];
  draft?: boolean;
}

export interface DocumentUploadResponse {
  id: number;
  originalName: string;
  extension: string;
  sizeBytes?: number;
}

export const projectService = {
  getAll: () => fetchApi<Project[]>('/projects'),

  getById: (id: string | number) =>
    fetchApi<Project>(`/projects/${id}`),

  create: (data: CreateProjectPayload) =>
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string | number, status: string) =>
    fetchApi<Project>(`/projects/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),

  getMyDrafts: () =>
    fetchApi<Project[]>('/projects/drafts'),

  deleteDraft: (id: string | number) =>
    fetchApi<void>(`/projects/${id}`, { method: 'DELETE' }),

  uploadDocument: (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<DocumentUploadResponse>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
