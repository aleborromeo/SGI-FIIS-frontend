import { api } from './api';

export interface CallResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string; // ABIERTA | CERRADA | FINALIZADA
  documentId?: number;
  researchLineIds: number[];
}

export interface CreateCallPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  researchLineIds: number[];
  documentId?: number;
  // Soporte dual snake_case para backend
  titulo_convocatoria?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
}

function normalizeStatus(status?: string): string {
  if (!status) return 'ABIERTA';
  const s = status.toUpperCase();
  if (s === 'OPEN' || s === 'ABIERTA') return 'ABIERTA';
  if (s === 'CLOSED' || s === 'CERRADA') return 'CERRADA';
  if (s === 'FINISHED' || s === 'FINALIZADA') return 'FINALIZADA';
  if (s === 'DRAFT' || s === 'BORRADOR') return 'ABIERTA';
  return s;
}

export function normalizeCall(data: any): CallResponse {
  if (!data) return {} as CallResponse;
  return {
    id: data.id_convocatoria !== undefined ? Number(data.id_convocatoria) : Number(data.id),
    title: data.titulo_convocatoria || data.title || '',
    description: data.descripcion || data.description || '',
    startDate: data.fecha_inicio || data.startDate || '',
    endDate: data.fecha_fin || data.endDate || '',
    status: normalizeStatus(data.estado || data.status),
    documentId: data.documentId,
    researchLineIds: data.researchLineIds || [],
  };
}

export const callService = {
  getAll: async (status?: string): Promise<CallResponse[]> => {
    const query = status ? `?status=${status}` : '';
    const res = await api.get<any[]>(`/api/v1/calls${query}`);
    return Array.isArray(res) ? res.map(normalizeCall) : [];
  },

  getById: async (id: number): Promise<CallResponse> => {
    const res = await api.get<any>(`/api/v1/calls/${id}`);
    return normalizeCall(res);
  },

  getVigent: async (): Promise<CallResponse[]> => {
    const res = await api.get<any[]>('/api/v1/calls/vigent');
    return Array.isArray(res) ? res.map(normalizeCall) : [];
  },

  checkPrerequisitos: (): Promise<{ hasActiveGroup: boolean; hasVigentCalls: boolean; docente: boolean; valid: boolean }> =>
    api.get('/api/v1/calls/prerequisitos'),

  create: async (data: CreateCallPayload): Promise<CallResponse> => {
    const payload = {
      ...data,
      titulo_convocatoria: data.title,
      descripcion: data.description,
      fecha_inicio: data.startDate,
      fecha_fin: data.endDate,
      estado: 'ABIERTA',
      status: 'ABIERTA',
    };
    const res = await api.post<any>('/api/v1/calls', payload);
    return normalizeCall(res);
  },

  updateStatus: async (id: number, status: string): Promise<CallResponse> => {
    const res = await api.patch<any>(`/api/v1/calls/${id}/status`, { 
      status, 
      estado: status 
    });
    return normalizeCall(res);
  },
};

