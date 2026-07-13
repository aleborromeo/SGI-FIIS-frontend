import { api } from './api';

export interface TraceabilityMovement {
  movementId: number;
  procedureId: number;
  procedureCode: string;
  actionUserName: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  observation: string | null;
  movementDate: string;
}

export interface AuditLogEntry {
  id: number;
  tableName: string;
  recordId: number;
  action: string;
  userId: number;
  userName?: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}

export const auditService = {
  getTraceability: async (procedureId: number): Promise<TraceabilityMovement[]> => {
    const res = await api.get<TraceabilityMovement[]>(
      `/api/reports/traceability/${procedureId}`
    );
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
