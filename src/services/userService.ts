import { fetchApi } from './api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  department?: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>('/users');
  },
  
  getById: async (id: string | number): Promise<User> => {
    return fetchApi<User>(`/users/${id}`);
  },
};
