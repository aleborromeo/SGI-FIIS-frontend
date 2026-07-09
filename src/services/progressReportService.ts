import { fetchApi } from './api';

export interface ProgressReport {
  id?: number | string;
  projectId?: number | string;
  type?: string;
  status?: string;
  percentage?: number;
  achievements?: string;
  difficulties?: string;
  recommendations?: string;
  fileId?: number | string;
  createdAt?: string;
}

export const progressReportService = {
  create: (data: any) =>
    fetchApi<any>('/api/progress-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string | number) =>
    fetchApi<any>(`/api/progress-reports/${id}`),

  getByProject: (projectId: string | number) =>
    fetchApi<any[]>(`/api/progress-reports/project/${projectId}`),

  forward: (id: string | number) =>
    fetchApi<any>(`/api/progress-reports/${id}/forward`, { method: 'PATCH' }),

  approve: (id: string | number) =>
    fetchApi<any>(`/api/progress-reports/${id}/approve`, { method: 'PATCH' }),

  observe: (id: string | number, observation: string) =>
    fetchApi<any>(`/api/progress-reports/${id}/observe`, {
      method: 'PATCH',
      body: JSON.stringify({ observation }),
    }),

  reject: (id: string | number) =>
    fetchApi<any>(`/api/progress-reports/${id}/reject`, { method: 'PATCH' }),

  amend: (id: string | number, data: any) =>
    fetchApi<any>(`/api/progress-reports/${id}/amend`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
