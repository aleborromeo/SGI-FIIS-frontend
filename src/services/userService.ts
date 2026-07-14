import { api } from './api';

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
  mustChangePassword?: boolean;
  createdAt?: string;
  active?: boolean;
  phone?: string;
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
    const res = await api.get<User[]>('/users', { params });
    return Array.isArray(res) ? res : [];
  },

  getReviewers: async (): Promise<User[]> => {
    const users = await api.get<User[]>('/users');
    if (!Array.isArray(users)) return [];
    return users.filter(
      (u) => u.active && REVIEWER_ROLES.includes(u.roleCode)
    );
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
    return fetchApi<void>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
    });
  },

  createUser: async (user: {
    dni: string;
    firstNames: string;
    lastNames: string;
    institutionalEmail?: string;
    phone?: string;
    roleCode: string;
  }): Promise<User & { temporaryPassword?: string }> => {
    return fetchApi<User & { temporaryPassword?: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  updateUser: async (id: number, user: {
    firstNames: string;
    lastNames: string;
    institutionalEmail: string;
    phone?: string;
    roleCode: string;
  }): Promise<User> => {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  resetPassword: async (id: number): Promise<{ message: string }> => {
    return api.patch<{ message: string }>(`/users/${id}/reset-password`);
  },
};
