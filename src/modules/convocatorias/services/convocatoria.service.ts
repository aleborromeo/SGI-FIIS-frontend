import { api } from '../../../services/api';
import type { Convocatoria, EligibilityResponse } from '../types/convocatoria.types';

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

export const convocatoriaService = {
  getActivas: async (): Promise<Convocatoria[]> => {
    const res = await api.get<any[]>('/api/v1/calls/vigent');
    return Array.isArray(res) ? res.map(normalizeConvocatoria) : [];
  },

  checkEligibility: async (): Promise<EligibilityResponse> => {
    return api.get<EligibilityResponse>('/api/v1/calls/prerequisitos');
  },
};
