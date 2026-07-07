import { fetchApi } from './api';

export interface Project {
  id: string;
  title: string;
  type: string;
  line: string;
  status: string;
  // ... other fields matching backend
}

export const projectService = {
  getAll: () => fetchApi<Project[]>('/projects'),
  getById: (id: string) => fetchApi<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) => 
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) => 
    fetchApi<Project>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
