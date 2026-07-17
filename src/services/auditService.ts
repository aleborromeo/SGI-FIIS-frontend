import { api } from './api';

export interface TraceabilityMovement {
  movementId: number;
  procedureId: number;
  procedureCode: string;
  actionUserName: string;
  actionUserRole: string | null;
  action: string;
  previousStatus: string;
  newStatus: string;
  observation: string | null;
  movementDate: string;
  ipOrigen: string | null;
}

export interface ProcedureRecentActivity {
  procedureId: number;
  procedureCode: string;
  procedureType: string;
  currentStatus: string;
  movementCount: number;
  lastMovementDate: string;
  lastAction: string;
  lastUserName: string;
}

export interface AuditLogEntry {
  id: number;
  tablaAfectada: string;
  idRegistro: number;
  accion: string;
  idUsuario: number;
  nombreUsuario: string;
  datosAnteriores: string | null;
  datosNuevos: string | null;
  ipOrigen: string;
  fechaAccion: string;
}

export const auditService = {
  getTraceability: async (procedureId: number): Promise<TraceabilityMovement[]> => {
    const res = await api.get<TraceabilityMovement[]>(
      `/api/reports/traceability/${procedureId}`
    );
    return Array.isArray(res) ? res : [];
  },

  getRecentActivity: async (days = 7): Promise<ProcedureRecentActivity[]> => {
    const res = await api.get<ProcedureRecentActivity[]>(
      '/api/reports/traceability/recent',
      { params: { days } }
    );
    return Array.isArray(res) ? res : [];
  },

  getAuditLog: async (page = 0, size = 20): Promise<AuditLogEntry[]> => {
    const res = await api.get<AuditLogEntry[]>('/api/audit', { params: { page, size } });
    return Array.isArray(res) ? res : [];
  },

  getAuditLogByTabla: async (tabla: string, page = 0, size = 20): Promise<AuditLogEntry[]> => {
    const res = await api.get<AuditLogEntry[]>(`/api/audit/tabla/${tabla}`, { params: { page, size } });
    return Array.isArray(res) ? res : [];
  },

  getProjectReport: async (params?: {
    groupId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<any> => {
    const query: Record<string, string | number> = {};
    if (params?.groupId) query.groupId = params.groupId;
    if (params?.status) query.status = params.status;
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;
    if (params?.page !== undefined) query.page = params.page;
    if (params?.size) query.size = params.size;
    return api.get('/api/reports/projects', { params: query });
  },

  getProcedureReport: async (params?: {
    groupId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    procedureType?: string;
    page?: number;
    size?: number;
  }): Promise<any> => {
    const query: Record<string, string | number> = {};
    if (params?.groupId) query.groupId = params.groupId;
    if (params?.status) query.status = params.status;
    if (params?.fromDate) query.fromDate = params.fromDate;
    if (params?.toDate) query.toDate = params.toDate;
    if (params?.procedureType) query.procedureType = params.procedureType;
    if (params?.page !== undefined) query.page = params.page;
    if (params?.size) query.size = params.size;
    return api.get('/api/reports/procedures', { params: query });
  },
};
