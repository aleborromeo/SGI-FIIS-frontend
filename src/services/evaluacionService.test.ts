import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  fetchApi: vi.fn(),
}));

import { evaluacionService, type EvaluacionResultRequest, type EvaluationFormPayload } from './evaluacionService';
import { fetchApi } from './api';

const mockFetchApi = vi.mocked(fetchApi);

describe('evaluacionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('assignReviewer', () => {
    it('calls fetchApi POST /evaluaciones/asignar', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      await evaluacionService.assignReviewer(1, null, 10);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/asignar', {
        method: 'POST',
        body: JSON.stringify({ idProyecto: 1, idPlanTesis: null, idEvaluador: 10 }),
      });
    });
  });

  describe('assignReviewers', () => {
    it('calls fetchApi POST /evaluaciones/asignar-multiple', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      await evaluacionService.assignReviewers(5, [10, 11]);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/asignar-multiple', {
        method: 'POST',
        body: JSON.stringify({ projectId: 5, reviewerIds: [10, 11] }),
      });
    });
  });

  describe('submitResult', () => {
    it('calls fetchApi POST /evaluaciones/:id/resultado', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      const payload: EvaluacionResultRequest = {
        idEvaluador: 10,
        resultado: 'APROBADO',
        puntaje: 95,
        observaciones: 'None',
      };
      await evaluacionService.submitResult(1, payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/1/resultado', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    });
  });

  describe('submitEvaluationForm', () => {
    it('calls fetchApi POST /evaluaciones/:id/evaluar', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      const payload: EvaluationFormPayload = {
        evaluatorId: 10,
        criteriaScores: [
          { criterionId: 1, criterionName: 'Criterio 1', score: 18, maxScore: 20, observations: 'OK' }
        ],
        totalScore: 18,
        observations: 'Good',
        recommendations: 'Proceed',
        dictamen: 'APROBADO',
      };
      await evaluacionService.submitEvaluationForm(1, payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/1/evaluar', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    });
  });

  describe('getByEvaluator', () => {
    it('calls fetchApi GET /evaluaciones/evaluador/:id', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await evaluacionService.getByEvaluator(10);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/evaluador/10');
      expect(result).toEqual([]);
    });
  });

  describe('getAnonymousDetail', () => {
    it('calls fetchApi GET /evaluaciones/:id/detalle-anonimo', async () => {
      const mockDetail = { expedienteCode: 'EXP-001', criterios: [] };
      mockFetchApi.mockResolvedValue(mockDetail);
      const result = await evaluacionService.getAnonymousDetail(1);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/1/detalle-anonimo');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getById', () => {
    it('calls fetchApi GET /evaluaciones/:id', async () => {
      const mockItem = { id: 1 };
      mockFetchApi.mockResolvedValue(mockItem);
      const result = await evaluacionService.getById(1);
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones/1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('listAll', () => {
    it('calls fetchApi GET /evaluaciones', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await evaluacionService.listAll();
      expect(mockFetchApi).toHaveBeenCalledWith('/evaluaciones');
      expect(result).toEqual([]);
    });
  });
});
