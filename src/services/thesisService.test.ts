import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  fetchApi: vi.fn(),
}));

import { thesisService } from './thesisService';
import { fetchApi } from './api';

const mockFetchApi = vi.mocked(fetchApi);

describe('thesisService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createPlan', () => {
    it('calls fetchApi POST /thesis/plans', async () => {
      const payload = { tituloTesis: 'Mock Title' };
      mockFetchApi.mockResolvedValue({ idPlanTesis: 1 });
      const result = await thesisService.createPlan(payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual({ idPlanTesis: 1 });
    });
  });

  describe('getPlanById', () => {
    it('calls fetchApi GET /thesis/plans/:id', async () => {
      mockFetchApi.mockResolvedValue({ idPlanTesis: 1 });
      const result = await thesisService.getPlanById('1');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1');
      expect(result).toEqual({ idPlanTesis: 1 });
    });
  });

  describe('getPlansByStudent', () => {
    it('calls fetchApi GET /thesis/plans/student/:id', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await thesisService.getPlansByStudent('2');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/student/2');
      expect(result).toEqual([]);
    });
  });

  describe('getPlansByGroup', () => {
    it('calls fetchApi GET /thesis/plans/group/:id', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await thesisService.getPlansByGroup('3');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/group/3');
      expect(result).toEqual([]);
    });
  });

  describe('getPendingPlans', () => {
    it('calls fetchApi GET /thesis/plans/pending', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await thesisService.getPendingPlans('coordinador');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/pending?revisor=coordinador');
      expect(result).toEqual([]);
    });
  });

  describe('approveCoordinator', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/coordinator/approve', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.approveCoordinator('1');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/coordinator/approve', {
        method: 'PATCH',
      });
    });
  });

  describe('observeCoordinator', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/coordinator/observe', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.observeCoordinator('1', 'Fix abstract');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/coordinator/observe', {
        method: 'PATCH',
        body: JSON.stringify({ observacion: 'Fix abstract' }),
      });
    });
  });

  describe('rejectCoordinator', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/coordinator/reject', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.rejectCoordinator('1', 'Wrong topic');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/coordinator/reject?motivo=Wrong%20topic', {
        method: 'PATCH',
      });
    });
  });

  describe('approveDirector', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/director/approve', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.approveDirector('1');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/director/approve', {
        method: 'PATCH',
      });
    });
  });

  describe('observeDirector', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/director/observe', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.observeDirector('1', 'Fix bibliography');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/director/observe', {
        method: 'PATCH',
        body: JSON.stringify({ observacion: 'Fix bibliography' }),
      });
    });
  });

  describe('rectifyPlan', () => {
    it('calls fetchApi PATCH /thesis/plans/:id/rectify', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.rectifyPlan('1', { title: 'New title' });
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/rectify', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'New title' }),
      });
    });
  });

  describe('issueDeanResolution', () => {
    it('calls fetchApi POST /thesis/plans/:id/dean/resolution', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.issueDeanResolution('1', { resolutionNo: '123' });
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/plans/1/dean/resolution', {
        method: 'POST',
        body: JSON.stringify({ resolutionNo: '123' }),
      });
    });
  });

  describe('createReport', () => {
    it('calls fetchApi POST /thesis/reports', async () => {
      const payload = { planId: 1 };
      mockFetchApi.mockResolvedValue({ idInformeTesis: 10 });
      const result = await thesisService.createReport(payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual({ idInformeTesis: 10 });
    });
  });

  describe('getReportById', () => {
    it('calls fetchApi GET /thesis/reports/:id', async () => {
      mockFetchApi.mockResolvedValue({ idInformeTesis: 10 });
      const result = await thesisService.getReportById(10);
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/reports/10');
      expect(result).toEqual({ idInformeTesis: 10 });
    });
  });

  describe('getReportByPlanId', () => {
    it('calls fetchApi GET /thesis/reports/plan/:planId', async () => {
      mockFetchApi.mockResolvedValue({ idInformeTesis: 10 });
      const result = await thesisService.getReportByPlanId(5);
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/reports/plan/5');
      expect(result).toEqual({ idInformeTesis: 10 });
    });
  });

  describe('approveReport', () => {
    it('calls fetchApi PATCH /thesis/reports/:id/approve', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.approveReport(10);
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/reports/10/approve', {
        method: 'PATCH',
      });
    });
  });

  describe('observeReport', () => {
    it('calls fetchApi PATCH /thesis/reports/:id/observe', async () => {
      mockFetchApi.mockResolvedValue({ success: true });
      await thesisService.observeReport(10, 'Fix formatting');
      expect(mockFetchApi).toHaveBeenCalledWith('/thesis/reports/10/observe?observacion=Fix%20formatting', {
        method: 'PATCH',
      });
    });
  });
});
