import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api, fetchApi }));

import { auditService } from './auditService';

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue([]);
  });

  it('getTraceability usa el endpoint por procedureId', async () => {
    await auditService.getTraceability(3);
    expect(api.get).toHaveBeenCalledWith('/api/reports/traceability/3');
  });

  it('getRecentActivity pasa days como param', async () => {
    await auditService.getRecentActivity(15);
    expect(api.get).toHaveBeenCalledWith('/api/reports/traceability/recent', { params: { days: 15 } });
  });

  it('getAuditLog y getAuditLogByTabla pasan page y size', async () => {
    await auditService.getAuditLog(2, 10);
    expect(api.get).toHaveBeenCalledWith('/api/audit', { params: { page: 2, size: 10 } });

    await auditService.getAuditLogByTabla('usuarios', 0, 5);
    expect(api.get).toHaveBeenCalledWith('/api/audit/tabla/usuarios', { params: { page: 0, size: 5 } });
  });

  it('getProjectReport y getProcedureReport construyen query params', async () => {
    await auditService.getProjectReport({ groupId: 1, status: 'ACTIVO', fromDate: '2026-01-01', toDate: '2026-02-01', page: 0, size: 20 });
    expect(api.get).toHaveBeenCalledWith('/api/reports/projects', {
      params: { groupId: 1, status: 'ACTIVO', fromDate: '2026-01-01', toDate: '2026-02-01', page: 0, size: 20 },
    });

    await auditService.getProcedureReport({ procedureType: 'PROYECTO', page: 1 });
    expect(api.get).toHaveBeenCalledWith('/api/reports/procedures', {
      params: { procedureType: 'PROYECTO', page: 1 },
    });
  });

  it('retornan [] si la respuesta no es array', async () => {
    api.get.mockResolvedValue({});
    expect(await auditService.getAuditLog()).toEqual([]);
    expect(await auditService.getTraceability(1)).toEqual([]);
  });
});
