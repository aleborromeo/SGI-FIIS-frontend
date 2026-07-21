import { api, fetchApi } from './api';

export interface User {
  id: number;
  dni: string;
  firstNames: string;
  lastNames: string;
  institutionalEmail: string;
  phone?: string;
  roleCode: string;
  roleDescription: string;
  active: boolean;
  status?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  dni: string;
  firstNames: string;
  lastNames: string;
  institutionalEmail?: string;
  phone?: string;
  roleCode: string;
}

export interface UpdateUserPayload {
  firstNames?: string;
  lastNames?: string;
  institutionalEmail?: string;
  phone?: string;
  roleCode?: string;
  active?: boolean;
}

const REVIEWER_ROLES = ['EVALUADOR', 'DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO'];

export const userService = {
  getAll: async (query?: string): Promise<User[]> => {
    const params = query ? { query } : undefined;
    const res = await api.get<any>('/users', { params });
    if (Array.isArray(res)) {
      return res;
    }
    if (res && Array.isArray(res.content)) {
      return res.content;
    }
    return [];
  },

  getReviewers: async (projectId?: number): Promise<User[]> => {
    const params = projectId ? { projectId } : undefined;
    const res = await api.get<User[]>('/evaluaciones/available-evaluators', { params });
    if (!Array.isArray(res)) return [];
    return res.map((u: any) => ({
      ...u,
      active: true,
    }));
  },

  getById: async (id: string | number): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    return api.post<User>('/users', data);
  },

  update: async (id: number, data: UpdateUserPayload): Promise<User> => {
    return api.put<User>(`/users/${id}`, data);
  },

  toggleStatus: async (id: number, active: boolean): Promise<User> => {
    return api.patch<User>(`/users/${id}/status`, { active });
  },

  rejectUser: async (id: number): Promise<void> => {
    return api.patch<void>(`/users/${id}/status`, { active: false });
  },

  activateUser: async (id: number): Promise<void> => {
    return api.patch<void>(`/users/${id}/status`, { active: true });
  },

  createUser: async (user: {
    dni: string;
    firstNames: string;
    lastNames: string;
    institutionalEmail?: string;
    phone?: string;
    roleCode: string;
  }): Promise<User & { temporaryPassword?: string }> => {
    return api.post<User & { temporaryPassword?: string }>('/users', user);
  },

  updateUser: async (id: number, user: {
    firstNames: string;
    lastNames: string;
    institutionalEmail: string;
    phone?: string;
    roleCode: string;
  }): Promise<User> => {
    return api.put<User>(`/users/${id}`, user);
  },

  resetPassword: async (id: number): Promise<{ message: string }> => {
    return api.patch<{ message: string }>(`/users/${id}/reset-password`);
  },
};
