import { api } from './api';

export interface ResearchLine {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ResearchLineRequest {
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ResearchGroup {
  id: number;
  code: string;
  name: string;
  acronym: string;
  description: string;
  coordinator?: any; // Assuming it returns a user object
}

export interface ResearchGroupRequest {
  code: string;
  name: string;
  acronym: string;
  description: string;
}

export const researchService = {
  // --- Líneas de Investigación ---
  getLines: async (onlyActive: boolean = false): Promise<ResearchLine[]> => {
    return api.get<ResearchLine[]>(`/research-lines?onlyActive=${onlyActive}`);
  },

  createLine: async (data: ResearchLineRequest): Promise<ResearchLine> => {
    return api.post<ResearchLine>('/research-lines', data);
  },

  changeLineStatus: async (id: number, active: boolean): Promise<ResearchLine> => {
    return api.patch<ResearchLine>(`/research-lines/${id}/status`, { active });
  },

  // --- Grupos de Investigación ---
  getGroups: async (): Promise<ResearchGroup[]> => {
    return api.get<ResearchGroup[]>('/research-groups');
  },

  createGroup: async (data: ResearchGroupRequest): Promise<ResearchGroup> => {
    return api.post<ResearchGroup>('/research-groups', data);
  },

  getGroupById: async (id: number): Promise<ResearchGroup> => {
    return api.get<ResearchGroup>(`/research-groups/${id}`);
  },

  assignCoordinator: async (id: number, userId: number): Promise<ResearchGroup> => {
    return api.patch<ResearchGroup>(`/research-groups/${id}/coordinator`, { userId });
  },

  getMembers: async (id: number): Promise<any[]> => {
    return api.get<any[]>(`/research-groups/${id}/members`);
  },

  addMember: async (id: number, userId: number): Promise<any> => {
    return api.post<any>(`/research-groups/${id}/members`, { userId });
  },

  removeMember: async (id: number, userId: number): Promise<any> => {
    return api.delete<any>(`/research-groups/${id}/members/${userId}`);
  },

  getGroupLines: async (id: number): Promise<ResearchLine[]> => {
    return api.get<ResearchLine[]>(`/research-groups/${id}/lines`);
  }
};
