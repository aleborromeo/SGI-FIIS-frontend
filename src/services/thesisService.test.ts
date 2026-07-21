import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchApi } = vi.hoisted(() => ({
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api: {}, fetchApi }));

import { thesisService } from './thesisService';

describe('thesisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApi.mockResolvedValue({ id: 1 });
  });

  it('createPlan postea a /thesis/plans', async () => {
    await thesisService.createPlan({ tituloTesis: 'X' });
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans', { method: 'POST', body: JSON.stringify({ tituloTesis: 'X' }) });
  });

  it('getPlanById, getPlansByStudent, getPlansByGroup, getPendingPlans usan GET', async () => {
    await thesisService.getPlanById('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3');

    await thesisService.getPlansByStudent('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/student/3');

    await thesisService.getPlansByGroup('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/group/3');

    await thesisService.getPendingPlans('DECANO');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/pending?revisor=DECANO');
  });

  it('aprobaciones de coordinador y director usan PATCH', async () => {
    await thesisService.approveCoordinator('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/coordinator/approve', { method: 'PATCH' });

    await thesisService.observeCoordinator('3', 'obs');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/coordinator/observe', { method: 'PATCH', body: JSON.stringify({ observacion: 'obs' }) });

    await thesisService.rejectCoordinator('3', 'motivo');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/coordinator/reject?motivo=' + encodeURIComponent('motivo'), { method: 'PATCH' });

    await thesisService.approveDirector('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/director/approve', { method: 'PATCH' });

    await thesisService.observeDirector('3', 'obs');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/director/observe', { method: 'PATCH', body: JSON.stringify({ observacion: 'obs' }) });
  });

  it('rectifyPlan y issueDeanResolution usan sus endpoints', async () => {
    await thesisService.rectifyPlan('3', { tituloTesis: 'Y' });
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/rectify', { method: 'PATCH', body: JSON.stringify({ tituloTesis: 'Y' }) });

    await thesisService.issueDeanResolution('3', { numero: 'R' });
    expect(fetchApi).toHaveBeenCalledWith('/thesis/plans/3/dean/resolution', { method: 'POST', body: JSON.stringify({ numero: 'R' }) });
  });

  it('report endpoints usan GET/PATCH', async () => {
    await thesisService.createReport({ tituloFinal: 'T' });
    expect(fetchApi).toHaveBeenCalledWith('/thesis/reports', { method: 'POST', body: JSON.stringify({ tituloFinal: 'T' }) });

    await thesisService.getReportById('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/reports/3');

    await thesisService.getReportByPlanId('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/reports/plan/3');

    await thesisService.approveReport('3');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/reports/3/approve', { method: 'PATCH' });

    await thesisService.observeReport('3', 'obs');
    expect(fetchApi).toHaveBeenCalledWith('/thesis/reports/3/observe?observacion=' + encodeURIComponent('obs'), { method: 'PATCH' });
  });
});
