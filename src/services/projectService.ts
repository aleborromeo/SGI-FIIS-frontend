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
  generalObjective?: string;
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
  status?: string;
  members?: ProjectMember[];

  // Compatibilidad temporal con pantallas antiguas
  line?: string;
  type?: string;
}

export interface CreateProjectPayload {
  title: string;
  summary: string;
  generalObjective: string;
  researchLineId: number;
  budget: number;
  startDate: string;
  endDate: string;
  executionPlace: string;
  researchGroupId: number;
}

export const projectService = {
  getAll: () => fetchApi<Project[]>('/projects'),
  getById: (id: string | number) =>
    fetchApi<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) =>
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string | number, status: string) =>
    fetchApi<Project>(`/projects/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),
};