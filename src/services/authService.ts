import { fetchApi } from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    roles: string[];
    firstName: string;
    lastName: string;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
};
