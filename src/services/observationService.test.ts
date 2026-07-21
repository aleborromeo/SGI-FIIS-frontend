import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fetchApi } = vi.hoisted(() => ({
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api: {}, fetchApi }));

import { observationService } from './observationService';

describe('observationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApi.mockResolvedValue([]);
  });

  it('getByProcedureId usa el endpoint con el procedureId', async () => {
    await observationService.getByProcedureId('3');
    expect(fetchApi).toHaveBeenCalledWith('/api/observations/procedure/3');
  });

  it('addRemedy postea el payload serializado', async () => {
    const payload = { applicantId: 1, description: 'd', attachedDocumentId: 2 };
    await observationService.addRemedy(3, payload);
    expect(fetchApi).toHaveBeenCalledWith('/api/observations/3/remedy', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});
