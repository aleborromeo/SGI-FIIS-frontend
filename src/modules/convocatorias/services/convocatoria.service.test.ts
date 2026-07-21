import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convocatoriaService, normalizeConvocatoria } from './convocatoria.service';
import { api } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

describe('convocatoria.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('normalizeConvocatoria', () => {
    it('returns empty object cast to Convocatoria if data is falsy', () => {
      expect(normalizeConvocatoria(null)).toEqual({});
    });

    it('correctly maps various field formats', () => {
      const mockRawData = {
        id_convocatoria: '15',
        titulo_convocatoria: 'Convocatoria de Investigación 2026',
        descripcion: 'Detalle de la convocatoria',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-06-30',
        estado: 'OPEN',
        poblacion_objetivo: 'DOCENTES',
        researchLineIds: [1, 2],
        documentId: 'doc-123',
      };

      const normalized = normalizeConvocatoria(mockRawData);
      expect(normalized).toEqual({
        id: 15,
        title: 'Convocatoria de Investigación 2026',
        description: 'Detalle de la convocatoria',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        status: 'ABIERTA',
        targetAudience: 'DOCENTES',
        researchLineIds: [1, 2],
        documentId: 'doc-123',
      });
    });

    it('handles fallback fields for id, title, description, and status mapping', () => {
      const mockRawData2 = {
        id: '20',
        title: 'Call 2',
        description: 'Call 2 description',
        startDate: '2026-02-01',
        endDate: '2026-03-01',
        status: 'CERRADA',
      };

      const normalized = normalizeConvocatoria(mockRawData2);
      expect(normalized.id).toBe(20);
      expect(normalized.title).toBe('Call 2');
      expect(normalized.status).toBe('CERRADA');
      expect(normalized.targetAudience).toBe('AMBOS'); // Default audience

      // Finalizada status
      expect(normalizeConvocatoria({ status: 'FINALIZADA' }).status).toBe('FINALIZADA');
      expect(normalizeConvocatoria({ status: 'FINISHED' }).status).toBe('FINALIZADA');

      // Invalid status maps to ABIERTA
      expect(normalizeConvocatoria({ status: 'UNKNOWN' }).status).toBe('ABIERTA');
      expect(normalizeConvocatoria({}).status).toBe('ABIERTA');
    });
  });

  describe('getActivas', () => {
    it('returns normalized convocatorias when api returns an array', async () => {
      const mockResponse = [
        { id: 1, title: 'Call 1', status: 'ABIERTA' },
        { id: 2, title: 'Call 2', status: 'CLOSED' },
      ];
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await convocatoriaService.getActivas();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].status).toBe('CERRADA');
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls/vigent');
    });

    it('returns empty array if api response is not an array', async () => {
      mockApi.get.mockResolvedValue({ error: 'Failed' });
      const result = await convocatoriaService.getActivas();
      expect(result).toEqual([]);
    });
  });

  describe('checkEligibility', () => {
    it('calls preconditions api endpoint', async () => {
      const mockEligibility = { eligible: true, code: 'OK' };
      mockApi.get.mockResolvedValue(mockEligibility);

      const result = await convocatoriaService.checkEligibility();
      expect(result).toEqual(mockEligibility);
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/calls/prerequisitos');
    });
  });
});
