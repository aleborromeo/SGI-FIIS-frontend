import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchApi } = vi.hoisted(() => ({
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api: {}, fetchApi }));

import { evaluacionService } from './evaluacionService';

describe('evaluacionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApi.mockResolvedValue({});
  });

  it('assignReviewer postea a /evaluaciones/asignar', async () => {
    await evaluacionService.assignReviewer(1, null, 9);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/asignar', {
      method: 'POST',
      body: JSON.stringify({ idProyecto: 1, idPlanTesis: null, idEvaluador: 9 }),
    });
  });

  it('assignReviewers postea a /evaluaciones/asignar-multiple', async () => {
    await evaluacionService.assignReviewers(5, [1, 2]);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/asignar-multiple', {
      method: 'POST',
      body: JSON.stringify({ projectId: 5, evaluadorIds: [1, 2] }),
    });
  });

  it('submitResult y submitEvaluationForm usan sus endpoints', async () => {
    await evaluacionService.submitResult(3, { idEvaluador: 1, resultado: 'APROBADO', puntaje: 10, observaciones: 'ok' });
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/3/resultado', {
      method: 'POST',
      body: JSON.stringify({ idEvaluador: 1, resultado: 'APROBADO', puntaje: 10, observaciones: 'ok' }),
    });

    const payload = {
      evaluatorId: 1,
      criteriaScores: [],
      totalScore: 0,
      observations: '',
      recommendations: '',
      dictamen: 'APROBADO' as const,
    };
    await evaluacionService.submitEvaluationForm(3, payload);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/3/evaluar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('getByEvaluator, getAnonymousDetail, getById, listAll usan GET', async () => {
    await evaluacionService.getByEvaluator(9);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/evaluador/9');

    await evaluacionService.getAnonymousDetail(9);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/9/detalle-anonimo');

    await evaluacionService.getById(9);
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones/9');

    await evaluacionService.listAll();
    expect(fetchApi).toHaveBeenCalledWith('/evaluaciones');
  });
});
