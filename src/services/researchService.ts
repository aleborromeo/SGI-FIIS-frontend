import { api } from './api';

// ── Tipos – Líneas de Investigación ──────────────────────────────────────────

export interface ResearchLine {
  id: number;
  lineCode?: string;
  lineName: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResearchLineRequest {
  lineCode?: string;
  lineName: string;
  description?: string;
}

export interface ResearchLineUpdateRequest {
  lineCode?: string;
  lineName: string;
  description?: string;
}

// ── Tipos – Grupos de Investigación ──────────────────────────────────────────

export interface ResearchGroup {
  id: number;
  groupCode: string;
  groupName: string;
  active: boolean;
  currentCoordinatorId?: number;
  coordinatorFirstNames?: string;
  coordinatorLastNames?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated kept for legacy compatibility */
  coordinator?: unknown;
}

export interface ResearchGroupRequest {
  groupCode: string;
  groupName: string;
}

// ── Tipos – Membresías ────────────────────────────────────────────────────────

/** Roles posibles de un miembro dentro de un grupo */
export type MemberRole =
  | 'INVESTIGADOR_PRINCIPAL'
  | 'COINVESTIGADOR'
  | 'COLABORADOR'
  | 'ASESOR'
  | string;

export interface GroupMember {
  /** ID de la membresía */
  id: number;
  /** ID del usuario */
  userId: number;
  userFirstNames: string;
  userLastNames: string;
  userEmail: string;
  /** Código del rol del usuario (ej: COORDINADOR_GRUPO, DOCENTE_INVESTIGADOR) */
  userRoleCode?: string;
  /** Rol dentro del grupo */
  memberRole?: MemberRole;
  /** Estado de la membresía (true = activa) */
  active: boolean;
  /** Fecha de ingreso al grupo */
  joinedAt?: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const researchService = {
  // ── Líneas de Investigación ─────────────────────────────────────────────

  /** Lista todas las líneas; si onlyActive=true filtra solo activas */
  getLines: async (onlyActive: boolean = false): Promise<ResearchLine[]> => {
    return api.get<ResearchLine[]>(`/research-lines?onlyActive=${onlyActive}`);
  },

  getLineById: async (id: number): Promise<ResearchLine> => {
    return api.get<ResearchLine>(`/research-lines/${id}`);
  },

  createLine: async (data: ResearchLineRequest): Promise<ResearchLine> => {
    return api.post<ResearchLine>('/research-lines', data);
  },

  updateLine: async (id: number, data: ResearchLineUpdateRequest): Promise<ResearchLine> => {
    return api.put<ResearchLine>(`/research-lines/${id}`, data);
  },

  changeLineStatus: async (id: number, active: boolean): Promise<ResearchLine> => {
    return api.patch<ResearchLine>(`/research-lines/${id}/status`, { active });
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

  // ── Grupos de Investigación ─────────────────────────────────────────────

  getGroups: async (): Promise<ResearchGroup[]> => {
    return api.get<ResearchGroup[]>('/research-groups');
  },

  getGroupById: async (id: number): Promise<ResearchGroup> => {
    return api.get<ResearchGroup>(`/research-groups/${id}`);
  },

  createGroup: async (data: ResearchGroupRequest): Promise<ResearchGroup> => {
    return api.post<ResearchGroup>('/research-groups', data);
  },

  updateGroup: async (id: number, data: ResearchGroupRequest): Promise<ResearchGroup> => {
    return api.put<ResearchGroup>(`/research-groups/${id}`, data);
  },

  deactivateGroup: async (id: number): Promise<ResearchGroup> => {
    return api.patch<ResearchGroup>(`/research-groups/${id}/status`, { active: false });
  },

  assignCoordinator: async (id: number, userId: number): Promise<ResearchGroup> => {
    return api.patch<ResearchGroup>(`/research-groups/${id}/coordinator`, { userId });
  },

  // ── Membresías ──────────────────────────────────────────────────────────

  /** Lista los miembros de un grupo */
  getMembers: async (id: number): Promise<GroupMember[]> => {
    return api.get<GroupMember[]>(`/research-groups/${id}/members`);
  },

  /** Agrega un miembro al grupo */
  addMember: async (id: number, userId: number): Promise<GroupMember> => {
    return api.post<GroupMember>(`/research-groups/${id}/members`, { userId });
  },

  /** Desactiva la membresía de un miembro (baja lógica, no eliminación) */
  removeMember: async (id: number, userId: number): Promise<GroupMember> => {
    return api.delete<GroupMember>(`/research-groups/${id}/members/${userId}`);
  },

  /**
   * Devuelve los usuarios (docentes) que NO tienen membresía activa en ningún grupo,
   * respetando la regla de negocio uq_membresias_activas.
   */
  getAvailableUsers: async (): Promise<{ id: number; firstNames: string; lastNames: string; institutionalEmail: string }[]> => {
    return api.get(`/research-groups/available-users`);
  },

  /** Devuelve usuarios con rol COORDINADOR_GRUPO (para dropdown de coordinador) */
  getCoordinatorCandidates: async (): Promise<{ id: number; firstNames: string; lastNames: string; institutionalEmail: string }[]> => {
    return api.get(`/research-groups/coordinator-candidates`);
  },

  // ── Líneas del Grupo ────────────────────────────────────────────────────

  getGroupLines: async (id: number): Promise<ResearchLine[]> => {
    return api.get<ResearchLine[]>(`/research-groups/${id}/lines`);
  },
};
