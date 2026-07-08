import { api } from './api';

export interface ResearchLine {
  id: number;
  lineName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchLineRequest {
  lineName: string;
}

export interface ResearchGroup {
  id: number;
  groupCode: string;
  groupName: string;
  currentCoordinatorId?: number;
  coordinatorFirstNames?: string;
  coordinatorLastNames?: string;
  active: boolean;
  coordinator?: any; // kept for legacy compatibility if mapped, though backend returns flattened
}

export interface ResearchGroupRequest {
  groupCode: string;
  groupName: string;
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

  getLineById: async (id: number): Promise<ResearchLine> => {
    return api.get<ResearchLine>(`/research-lines/${id}`);
  },

  getGroupsByLine: async (id: number): Promise<ResearchGroup[]> => {
    return api.get<ResearchGroup[]>(`/research-lines/${id}/groups`);
  },

  assignGroupToLine: async (lineId: number, groupId: number): Promise<void> => {
    return api.post<void>(`/research-lines/${lineId}/groups/${groupId}`, {});
  },

  removeGroupFromLine: async (lineId: number, groupId: number): Promise<void> => {
    return api.delete<void>(`/research-lines/${lineId}/groups/${groupId}`);
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
