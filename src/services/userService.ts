import { fetchApi } from './api';

export interface User {
  id: number;
  dni: string;
  firstNames: string;
  lastNames: string;
  institutionalEmail: string;
  roleCode: string;
  roleDescription: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>('/users');
  },
  
  getById: async (id: string | number): Promise<User> => {
    return fetchApi<User>(`/users/${id}`);
  },
};
