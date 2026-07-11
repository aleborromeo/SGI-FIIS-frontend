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

function normalizeStatus(status?: string): 'ABIERTA' | 'CERRADA' | 'FINALIZADA' | 'BORRADOR' {
  if (!status) return 'ABIERTA';
  const s = status.toUpperCase();
  if (s === 'OPEN' || s === 'ABIERTA') return 'ABIERTA';
  if (s === 'CLOSED' || s === 'CERRADA') return 'CERRADA';
  if (s === 'FINISHED' || s === 'FINALIZADA') return 'FINALIZADA';
  if (s === 'DRAFT' || s === 'BORRADOR') return 'BORRADOR';
  return s as any;
}

export function normalizeConvocatoria(data: any): Convocatoria {
  if (!data) return {} as Convocatoria;
  return {
    id: data.id_convocatoria !== undefined ? Number(data.id_convocatoria) : Number(data.id),
    title: data.titulo_convocatoria || data.title || '',
    description: data.descripcion || data.description || '',
    startDate: data.fecha_inicio || data.startDate || '',
    endDate: data.fecha_fin || data.endDate || '',
    status: normalizeStatus(data.estado || data.status),
    researchLineIds: data.researchLineIds || [],
    documentId: data.documentId,
  };
}

const API_PREFIX = '/api/v1';

export const convocatoriaService = {
  getActivas: async (): Promise<Convocatoria[]> => {
    const { data } = await httpClient.get<any[]>(`${API_PREFIX}/calls/vigent`);
    return Array.isArray(data) ? data.map(normalizeConvocatoria) : [];
  },

  checkEligibility: async (): Promise<EligibilityResponse> => {
    const { data } = await httpClient.get<EligibilityResponse>(`${API_PREFIX}/calls/prerequisitos`);
    return data;
  },
};
