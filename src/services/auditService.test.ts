import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { auditService } from './auditService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('auditService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getTraceability', () => {
    it('calls GET /api/reports/traceability/:id', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await auditService.getTraceability(1);
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/traceability/1');
      expect(result).toEqual([]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await auditService.getTraceability(1);
      expect(result).toEqual([]);
    });
  });

  describe('getRecentActivity', () => {
    it('calls GET /api/reports/traceability/recent with default parameters', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await auditService.getRecentActivity();
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/traceability/recent', { params: { days: 7 } });
      expect(result).toEqual([]);
    });

    it('calls GET with custom days', async () => {
      mockApi.get.mockResolvedValue([]);
      await auditService.getRecentActivity(15);
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/traceability/recent', { params: { days: 15 } });
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await auditService.getRecentActivity();
      expect(result).toEqual([]);
    });
  });

  describe('getAuditLog', () => {
    it('calls GET /api/audit with page and size', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await auditService.getAuditLog(1, 10);
      expect(mockApi.get).toHaveBeenCalledWith('/api/audit', { params: { page: 1, size: 10 } });
      expect(result).toEqual([]);
    });

    it('uses default pagination parameters', async () => {
      mockApi.get.mockResolvedValue([]);
      await auditService.getAuditLog();
      expect(mockApi.get).toHaveBeenCalledWith('/api/audit', { params: { page: 0, size: 20 } });
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await auditService.getAuditLog();
      expect(result).toEqual([]);
    });
  });

  describe('getAuditLogByTabla', () => {
    it('calls GET /api/audit/tabla/:tabla with page and size', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await auditService.getAuditLogByTabla('users', 2, 15);
      expect(mockApi.get).toHaveBeenCalledWith('/api/audit/tabla/users', { params: { page: 2, size: 15 } });
      expect(result).toEqual([]);
    });

    it('uses default pagination parameters', async () => {
      mockApi.get.mockResolvedValue([]);
      await auditService.getAuditLogByTabla('users');
      expect(mockApi.get).toHaveBeenCalledWith('/api/audit/tabla/users', { params: { page: 0, size: 20 } });
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await auditService.getAuditLogByTabla('users');
      expect(result).toEqual([]);
    });
  });

  describe('getProjectReport', () => {
    it('calls GET /api/reports/projects with query mapping', async () => {
      mockApi.get.mockResolvedValue({ content: [] });
      const params = {
        groupId: 5,
        status: 'APROBADO',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        page: 0,
        size: 10,
      };
      const result = await auditService.getProjectReport(params);
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/projects', { params });
      expect(result).toEqual({ content: [] });
    });

    it('handles missing/undefined parameters', async () => {
      mockApi.get.mockResolvedValue({ content: [] });
      await auditService.getProjectReport();
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/projects', { params: {} });
    });
  });

  describe('getProcedureReport', () => {
    it('calls GET /api/reports/procedures with query mapping', async () => {
      mockApi.get.mockResolvedValue({ content: [] });
      const params = {
        groupId: 5,
        status: 'PENDIENTE',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        procedureType: 'THESIS',
        page: 0,
        size: 10,
      };
      const result = await auditService.getProcedureReport(params);
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/procedures', { params });
      expect(result).toEqual({ content: [] });
    });

    it('handles missing/undefined parameters', async () => {
      mockApi.get.mockResolvedValue({ content: [] });
      await auditService.getProcedureReport();
      expect(mockApi.get).toHaveBeenCalledWith('/api/reports/procedures', { params: {} });
    });
  });
});
