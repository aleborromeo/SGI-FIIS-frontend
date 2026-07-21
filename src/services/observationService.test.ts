import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  fetchApi: vi.fn(),
}));

import { observationService, type RemedyRequest } from './observationService';
import { fetchApi } from './api';

const mockFetchApi = vi.mocked(fetchApi);

describe('observationService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getByProcedureId', () => {
    it('calls fetchApi GET /api/observations/procedure/:id', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await observationService.getByProcedureId('5');
      expect(mockFetchApi).toHaveBeenCalledWith('/api/observations/procedure/5');
      expect(result).toEqual([]);
    });
  });

  describe('addRemedy', () => {
    it('calls fetchApi POST /api/observations/:id/remedy', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      const payload: RemedyRequest = {
        applicantId: 10,
        description: 'Fixed observation',
        attachedDocumentId: 15,
      };
      await observationService.addRemedy(1, payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/api/observations/1/remedy', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    });
  });
});
