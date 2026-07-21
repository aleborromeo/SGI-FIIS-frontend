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

import { callService, normalizeCall } from './callService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('callService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('normalizeCall & normalizeStatus', () => {
    it('returns empty object when data is falsy', () => {
      expect(normalizeCall(null)).toEqual({});
      expect(normalizeCall(undefined)).toEqual({});
    });

    it('normalizes status field correctly for various cases', () => {
      // Test default status
      expect(normalizeCall({ id: 1 }).status).toBe('ABIERTA');

      // Test OPEN / ABIERTA
      expect(normalizeCall({ id: 1, estado: 'open' }).status).toBe('ABIERTA');
      expect(normalizeCall({ id: 1, status: 'ABIERTA' }).status).toBe('ABIERTA');

      // Test CLOSED / CERRADA
      expect(normalizeCall({ id: 1, estado: 'CLOSED' }).status).toBe('CERRADA');
      expect(normalizeCall({ id: 1, status: 'cerrada' }).status).toBe('CERRADA');

      // Test FINISHED / FINALIZADA
      expect(normalizeCall({ id: 1, estado: 'finished' }).status).toBe('FINALIZADA');
      expect(normalizeCall({ id: 1, status: 'finalizada' }).status).toBe('FINALIZADA');

      // Test DRAFT / BORRADOR
      expect(normalizeCall({ id: 1, estado: 'draft' }).status).toBe('ABIERTA');
      expect(normalizeCall({ id: 1, status: 'borrador' }).status).toBe('ABIERTA');

      // Test unknown status passes through
      expect(normalizeCall({ id: 1, estado: 'UNKNOWN_STATUS' }).status).toBe('UNKNOWN_STATUS');
    });

    it('maps id_convocatoria and id correctly', () => {
      expect(normalizeCall({ id_convocatoria: '10' }).id).toBe(10);
      expect(normalizeCall({ id: '20' }).id).toBe(20);
    });

    it('handles targetAudience mapping', () => {
      expect(normalizeCall({ targetAudience: 'ESTUDIANTE' }).targetAudience).toBe('ESTUDIANTE');
      expect(normalizeCall({ poblacion_objetivo: 'DOCENTE' }).targetAudience).toBe('DOCENTE');
      expect(normalizeCall({}).targetAudience).toBe('AMBOS'); // Default
    });
  });

  describe('getAll', () => {
    it('calls GET /api/v1/calls without status', async () => {
      mockApi.get.mockResolvedValue([
        { id: 1, title: 'Call 1' }
      ]);
      const result = await callService.getAll();
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls');
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Call 1');
    });

    it('calls GET /api/v1/calls with status query parameter', async () => {
      mockApi.get.mockResolvedValue([]);
      await callService.getAll('ABIERTA');
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls?status=ABIERTA');
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await callService.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('calls GET /api/v1/calls/:id', async () => {
      mockApi.get.mockResolvedValue({ id: 5, title: 'Test Call' });
      const result = await callService.getById(5);
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls/5');
      expect(result.title).toBe('Test Call');
      expect(result.id).toBe(5);
    });
  });

  describe('getVigent', () => {
    it('calls GET /api/v1/calls/vigent', async () => {
      mockApi.get.mockResolvedValue([{ id: 1, title: 'Vigent 1' }]);
      const result = await callService.getVigent();
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls/vigent');
      expect(result.length).toBe(1);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await callService.getVigent();
      expect(result).toEqual([]);
    });
  });

  describe('checkPrerequisitos', () => {
    it('calls GET /api/v1/calls/prerequisitos', async () => {
      const mockResult = { hasActiveGroup: true, hasVigentCalls: true, docente: true, valid: true };
      mockApi.get.mockResolvedValue(mockResult);
      const result = await callService.checkPrerequisitos();
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls/prerequisitos');
      expect(result).toEqual(mockResult);
    });
  });

  describe('create', () => {
    it('calls POST /api/v1/calls with normalized backend payload', async () => {
      const input = {
        title: 'New Title',
        description: 'New Description',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        targetAudience: 'ESTUDIANTES',
      };
      mockApi.post.mockResolvedValue({ id: 1, title: 'New Title' });
      const result = await callService.create(input);
      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/calls', {
        ...input,
        titulo_convocatoria: 'New Title',
        descripcion: 'New Description',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-12-31',
        poblacion_objetivo: 'ESTUDIANTES',
        estado: 'ABIERTA',
        status: 'ABIERTA',
      });
      expect(result.id).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('calls PATCH /api/v1/calls/:id/status', async () => {
      mockApi.patch.mockResolvedValue({ id: 1, status: 'CERRADA' });
      const result = await callService.updateStatus(1, 'CERRADA');
      expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/calls/1/status', {
        status: 'CERRADA',
        estado: 'CERRADA',
      });
      expect(result.status).toBe('CERRADA');
    });
  });

  describe('update', () => {
    it('calls PUT /api/v1/calls/:id', async () => {
      const input = {
        title: 'Updated Title',
        description: 'Updated Description',
        startDate: '2026-02-01',
        endDate: '2026-11-30',
        targetAudience: 'DOCENTES',
        researchLineIds: [1, 2],
        documentId: 99,
      };
      mockApi.put.mockResolvedValue({ id: 2, title: 'Updated Title' });
      const result = await callService.update(2, input);
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/calls/2', {
        title: 'Updated Title',
        description: 'Updated Description',
        startDate: '2026-02-01',
        endDate: '2026-11-30',
        targetAudience: 'DOCENTES',
        poblacion_objetivo: 'DOCENTES',
        researchLineIds: [1, 2],
        documentId: 99,
      });
      expect(result.id).toBe(2);
    });
  });
});
