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

import { progressReportService } from './progressReportService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('progressReportService mappers & helper branches', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getPendingReports', () => {
    it('calls GET /api/progress-reports with mapped backend status', async () => {
      mockApi.get.mockResolvedValue({
        content: [
          {
            id: 101,
            projectId: 1,
            projectTitle: 'Title 1',
            responsibleName: 'Name 1',
            registrationDate: '2026-07-20',
            progressPercentage: 50,
            reportStatus: 'PENDING',
            achievements: 'Achieved stuff',
            difficulties: 'Hard stuff',
            attachedDocumentId: 50,
            period: 'Q1',
          },
        ],
      });

      const result = await progressReportService.getPendingReports('PENDIENTE');

      expect(mockApi.get).toHaveBeenCalledWith('/api/progress-reports', {
        params: { status: 'PENDING' },
      });
      expect(result).toEqual([
        {
          id: 101,
          reportNumber: 101,
          projectId: 1,
          projectTitle: 'Title 1',
          responsibleName: 'Name 1',
          reportDate: '2026-07-20',
          physicalProgress: 50,
          financialProgress: 50,
          status: 'PENDIENTE',
          observations: 'Logros: Achieved stuff. Dificultades: Hard stuff',
          attachedDocumentId: 50,
          period: 'Q1',
        },
      ]);
    });

    it('handles alternative status parameters and fallback when status is unknown', async () => {
      mockApi.get.mockResolvedValue([
        {
          id: 102,
          projectId: 2,
          status: 'UNKNOWN_BE',
        },
      ]);

      const result = await progressReportService.getPendingReports();

      expect(mockApi.get).toHaveBeenCalledWith('/api/progress-reports', {
        params: undefined,
      });
      expect(result[0].status).toBe('PENDIENTE'); // fallback to frontend PENDIENTE
    });
  });

  describe('getProjectsByRole', () => {
    it('calls GET /api/progress-reports and returns project list', async () => {
      const mockProjects = [{ id: 1, title: 'Project 1', status: 'ACTIVE' }];
      mockApi.get.mockResolvedValue(mockProjects);

      const result = await progressReportService.getProjectsByRole();

      expect(mockApi.get).toHaveBeenCalledWith('/api/progress-reports');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getByProject', () => {
    it('calls GET /api/progress-reports/project/:id', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await progressReportService.getByProject(5);
      expect(mockApi.get).toHaveBeenCalledWith('/api/progress-reports/project/5');
      expect(result).toEqual([]);
    });
  });

  describe('getDetail', () => {
    it('calls GET /api/progress-reports/:id and maps full detail', async () => {
      const mockRawDetail = {
        id: 200,
        projectId: 4,
        period: 'Q2',
        registrationDate: '2026-07-10',
        lastUpdatedDate: '2026-07-15',
        reportStatus: 'APPROVED',
        observations: 'All clear',
        attachedDocumentId: 88,
      };
      mockApi.get.mockResolvedValue(mockRawDetail);

      const result = await progressReportService.getDetail(200);

      expect(mockApi.get).toHaveBeenCalledWith('/api/progress-reports/200');
      expect(result.id).toBe(200);
      expect(result.status).toBe('APROBADO');
      expect(result.attachments).toEqual([
        {
          id: 88,
          fileName: 'informe_avance_200.pdf',
          fileType: 'pdf',
          url: '/api/documents/download/88',
          uploadedAt: '2026-07-10',
        },
      ]);
      expect(result.comments).toEqual([
        {
          id: 1,
          authorName: 'Sistema de Trazabilidad',
          authorRole: 'SISTEMA',
          content: 'Últimas observaciones: All clear',
          createdAt: '2026-07-15',
        },
      ]);
    });
  });

  describe('createReport', () => {
    it('calls POST /api/progress-reports', async () => {
      const payload = {
        projectId: 1,
        reportType: 'PARCIAL' as const,
        period: 'Q3',
        progressPercentage: 75,
        achievements: 'none',
        difficulties: 'none',
        recommendations: 'none',
      };
      mockApi.post.mockResolvedValue({ id: 1 });
      const result = await progressReportService.createReport(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/api/progress-reports', payload);
      expect(result.id).toBe(1);
    });
  });

  describe('amendReport', () => {
    it('calls PATCH /api/progress-reports/:id/amend', async () => {
      mockApi.patch.mockResolvedValue({ id: 1 });
      await progressReportService.amendReport(10, { amendmentDocumentId: 99 });
      expect(mockApi.patch).toHaveBeenCalledWith('/api/progress-reports/10/amend', {
        amendmentDocumentId: 99,
      });
    });
  });

  describe('forwardReport', () => {
    it('calls PATCH /api/progress-reports/:id/forward', async () => {
      mockApi.patch.mockResolvedValue({ id: 1 });
      await progressReportService.forwardReport(10);
      expect(mockApi.patch).toHaveBeenCalledWith('/api/progress-reports/10/forward', {});
    });
  });

  describe('approveReport', () => {
    it('calls PATCH /api/progress-reports/:id/approve', async () => {
      mockApi.patch.mockResolvedValue({ id: 1 });
      await progressReportService.approveReport(10);
      expect(mockApi.patch).toHaveBeenCalledWith('/api/progress-reports/10/approve', {});
    });
  });

  describe('observeReport', () => {
    it('calls PATCH /api/progress-reports/:id/observe', async () => {
      mockApi.patch.mockResolvedValue({ id: 1 });
      await progressReportService.observeReport(10, 'Needs correction');
      expect(mockApi.patch).toHaveBeenCalledWith('/api/progress-reports/10/observe', {
        observation: 'Needs correction',
      });
    });
  });

  describe('rejectReport', () => {
    it('calls PATCH /api/progress-reports/:id/reject', async () => {
      mockApi.patch.mockResolvedValue({ id: 1 });
      await progressReportService.rejectReport(10);
      expect(mockApi.patch).toHaveBeenCalledWith('/api/progress-reports/10/reject', {});
    });
  });
});
