import { api } from './api';

export interface CallResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string; // DRAFT | OPEN | CLOSED | FINISHED
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
}

export const callService = {
  getAll: (status?: string): Promise<CallResponse[]> => {
    const query = status ? `?status=${status}` : '';
    return api.get<CallResponse[]>(`/calls${query}`);
  },

  getById: (id: number): Promise<CallResponse> =>
    api.get<CallResponse>(`/calls/${id}`),

  getVigent: (): Promise<CallResponse[]> =>
    api.get<CallResponse[]>('/calls/vigent'),

  checkPrerequisitos: (): Promise<{ hasActiveGroup: boolean; hasVigentCalls: boolean; isDocente: boolean; valid: boolean }> =>
    api.get('/calls/prerequisitos'),

  create: (data: CreateCallPayload): Promise<CallResponse> =>
    api.post<CallResponse>('/calls', data),

  updateStatus: (id: number, status: string): Promise<CallResponse> =>
    api.patch<CallResponse>(`/calls/${id}/status`, { status }),
};
