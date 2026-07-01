import { api } from './api';
import type { LoginResponse, UserProfile } from '../types/auth';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', { email, password });
  },

  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/auth/profile');
  },

  async getDashboardData<T>(): Promise<T> {
    return api.get<T>('/dashboard/me');
  }
};
