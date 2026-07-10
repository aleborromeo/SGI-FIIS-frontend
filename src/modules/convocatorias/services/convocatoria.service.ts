import axios from 'axios';
import type { Convocatoria, EligibilityResponse } from '../types/convocatoria.types';

function getToken(): string | null {
  const token =
    localStorage.getItem('sgi_token') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');
  return token ? token.replace(/^Bearer\s+/i, '') : null;
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sgi_token');
      localStorage.removeItem('sgi_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

const API_PREFIX = '/api/v1';

export const convocatoriaService = {
  getActivas: async (): Promise<Convocatoria[]> => {
    const { data } = await httpClient.get<Convocatoria[]>(`${API_PREFIX}/calls/vigent`);
    return data;
  },

  checkEligibility: async (): Promise<EligibilityResponse> => {
    const { data } = await httpClient.get<EligibilityResponse>(`${API_PREFIX}/calls/prerequisitos`);
    return data;
  },
};
