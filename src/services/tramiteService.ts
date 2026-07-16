import { api } from './api';
import { documentService } from './documentService';
import type {
  EstadoTramite,
  MovimientoTramite,
  ObservacionTramite,
  Tramite,
  ProcedureResponseDto,
  ProcedureMovementResponseDto,
} from '../types/tramites';

export const PENDING_STATE_BY_ROLE: Record<string, EstadoTramite> = {
  COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
  DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
  DECANO: 'PENDIENTE_DECANATO',
};

function mapProcedureToTramite(dto: ProcedureResponseDto): Tramite {
  return {
    id: dto.id,
    codigoTramite: dto.code,
    tipoTramite: dto.procedureType,
    tituloReferencia: dto.code,
    idSolicitante: dto.applicantId,
    nombreSolicitante: '',
    estadoActual: dto.currentStatus,
    rolRevisorActual: dto.currentReviewerRole,
    observacionActual: dto.currentObservation,
    fechaCreacion: dto.sentAt || '',
    fechaActualizacion: dto.updatedAt || '',
  };
}

function mapMovementToMovimiento(
  dto: ProcedureMovementResponseDto,
  tramiteId: number,
): MovimientoTramite {
  return {
    id: 0,
    idTramite: tramiteId,
    idUsuarioAccion: dto.actionUserId,
    nombreUsuarioAccion: '',
    accion: dto.action,
    estadoAnterior: dto.previousStatus,
    estadoNuevo: dto.newStatus,
    observacion: dto.comment,
    fechaMovimiento: dto.movementAt,
  };
}

export const tramiteService = {
  getMyProcedures: async (): Promise<Tramite[]> => {
    const res = await api.get<ProcedureResponseDto[]>('/api/v1/procedures');
    if (!Array.isArray(res)) return [];
    return res.map(mapProcedureToTramite);
  },

  getPendingForRole: async (role: string): Promise<Tramite[]> => {
    const res = await api.get<ProcedureResponseDto[]>('/api/v1/procedures', {
      params: { role },
    });
    if (!Array.isArray(res)) return [];
    return res.map(mapProcedureToTramite);
  },

  getById: async (id: number): Promise<Tramite> => {
    const res = await api.get<ProcedureResponseDto>(`/api/v1/procedures/${id}`);
    return mapProcedureToTramite(res);
  },

  getTraceability: async (id: number): Promise<MovimientoTramite[]> => {
    const res = await api.get<ProcedureMovementResponseDto[]>(
      `/api/v1/procedures/${id}/traceability`
    );
    if (!Array.isArray(res)) return [];
    return res.map((dto) => mapMovementToMovimiento(dto, id));
  },

  getObservacionesByTramite: async (idTramite: number): Promise<ObservacionTramite[]> => {
    const res = await api.get<any[]>(`/api/observations/procedure/${idTramite}`);
    if (!Array.isArray(res)) return [];
    return res.map((o) => ({
      id: o.id,
      idTramite: o.procedureId,
      tipoObservacion: o.type,
      descripcion: o.description,
      estadoObservacion: o.status,
      rolRevisor: o.reviewerRole,
      fechaRegistro: o.createdAt,
      subsanaciones: [],
    }));
  },

  approve: async (id: number): Promise<Tramite> => {
    const res = await api.put<ProcedureResponseDto>(`/api/v1/procedures/${id}/approve`);
    return mapProcedureToTramite(res);
  },

  flag: async (id: number, textoObservacion: string, attachedDocumentId?: number): Promise<Tramite> => {
    const res = await api.put<ProcedureResponseDto>(`/api/v1/procedures/${id}/flag`, {
      textoObservacion,
      ...(attachedDocumentId ? { attachedDocumentId } : {}),
    });
    return mapProcedureToTramite(res);
  },

  reject: async (id: number): Promise<Tramite> => {
    const res = await api.put<ProcedureResponseDto>(`/api/v1/procedures/${id}/reject`);
    return mapProcedureToTramite(res);
  },

  remediate: async (id: number, detalleSubsanacion: string): Promise<Tramite> => {
    const res = await api.put<ProcedureResponseDto>(`/api/v1/procedures/${id}/remediate`, {
      detalleSubsanacion,
    });
    return mapProcedureToTramite(res);
  },

  registerResolution: async (id: number): Promise<Tramite> => {
    const res = await api.put<ProcedureResponseDto>(`/api/v1/procedures/${id}/resolution`);
    return mapProcedureToTramite(res);
  },

  subsanarObservacion: async (idObservacion: number, descripcion: string, file: File | null): Promise<void> => {
    let attachedDocumentId: number | undefined;
    if (file) {
      const uploaded = await documentService.upload(file);
      attachedDocumentId = uploaded.id;
    }
    const userStr = localStorage.getItem('sgi_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return api.post<void>(`/api/observations/${idObservacion}/remedy`, {
      applicantId: user?.id ?? 1,
      description: descripcion,
      attachedDocumentId,
    });
  },
};
