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
  },

  async register(data: any): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/register', data);
  },

  async verifyRegistration(email: string, code: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/verify-registration', { email, code });
  },

  async resendCode(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/resend-code', { email });
  }
};
