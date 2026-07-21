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

vi.mock('./documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

import { tramiteService } from './tramiteService';
import { api } from './api';
import { documentService } from './documentService';

const mockApi = vi.mocked(api);
const mockDocService = vi.mocked(documentService);

describe('tramiteService & DTO mapping', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  describe('getMyProcedures', () => {
    it('calls GET /api/v1/procedures and maps response', async () => {
      const mockDtos = [
        {
          id: 101,
          code: 'PROC-101',
          procedureType: 'PROJECT',
          applicantId: 2,
          currentStatus: 'PENDIENTE_COORDINADOR',
          currentReviewerRole: 'COORDINADOR_GRUPO',
          currentObservation: 'Fix summary',
          sentAt: '2026-07-20T00:00:00Z',
          updatedAt: '2026-07-20T10:00:00Z',
          thesisReferenceId: 5,
          projectReferenceId: 6,
          reportReferenceId: 7,
        },
      ];
      mockApi.get.mockResolvedValue(mockDtos);

      const result = await tramiteService.getMyProcedures();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/procedures');
      expect(result).toEqual([
        {
          id: 101,
          codigoTramite: 'PROC-101',
          tipoTramite: 'PROJECT',
          tituloReferencia: 'PROC-101',
          idSolicitante: 2,
          nombreSolicitante: '',
          estadoActual: 'PENDIENTE_COORDINADOR',
          rolRevisorActual: 'COORDINADOR_GRUPO',
          observacionActual: 'Fix summary',
          fechaCreacion: '2026-07-20T00:00:00Z',
          fechaActualizacion: '2026-07-20T10:00:00Z',
          thesisReferenceId: 5,
          projectReferenceId: 6,
          reportReferenceId: 7,
        },
      ]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await tramiteService.getMyProcedures();
      expect(result).toEqual([]);
    });
  });

  describe('getPendingForRole', () => {
    it('calls GET /api/v1/procedures with role param', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await tramiteService.getPendingForRole('COORDINADOR_GRUPO');
      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/procedures', {
        params: { role: 'COORDINADOR_GRUPO' },
      });
      expect(result).toEqual([]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await tramiteService.getPendingForRole('COORDINADOR_GRUPO');
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('calls GET /api/v1/procedures/:id and maps response', async () => {
      const mockDto = {
        id: 101,
        code: 'PROC-101',
        procedureType: 'PROJECT',
        applicantId: 2,
        currentStatus: 'PENDIENTE_COORDINADOR',
        currentReviewerRole: 'COORDINADOR_GRUPO',
        currentObservation: null,
        sentAt: null,
        updatedAt: null,
      };
      mockApi.get.mockResolvedValue(mockDto);

      const result = await tramiteService.getById(101);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/procedures/101');
      expect(result.fechaCreacion).toBe('');
      expect(result.fechaActualizacion).toBe('');
    });
  });

  describe('getTraceability', () => {
    it('calls GET /api/v1/procedures/:id/traceability and maps movements', async () => {
      const mockMovements = [
        {
          actionUserId: 10,
          action: 'APPROVE',
          previousStatus: 'PENDIENTE',
          newStatus: 'APROBADO',
          comment: 'Good',
          movementAt: '2026-07-20T10:00:00Z',
        },
      ];
      mockApi.get.mockResolvedValue(mockMovements);

      const result = await tramiteService.getTraceability(101);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/procedures/101/traceability');
      expect(result).toEqual([
        {
          id: 0,
          idTramite: 101,
          idUsuarioAccion: 10,
          nombreUsuarioAccion: '',
          accion: 'APPROVE',
          estadoAnterior: 'PENDIENTE',
          estadoNuevo: 'APROBADO',
          observacion: 'Good',
          fechaMovimiento: '2026-07-20T10:00:00Z',
        },
      ]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await tramiteService.getTraceability(101);
      expect(result).toEqual([]);
    });
  });

  describe('getObservacionesByTramite', () => {
    it('calls GET /api/observations/procedure/:id and fetches remedies per observation', async () => {
      mockApi.get.mockImplementation(async (url: string) => {
        if (url.includes('/api/observations/procedure/')) {
          return [
            {
              id: 50,
              procedureId: 101,
              type: 'TECHNICAL',
              description: 'Wrong calculations',
              status: 'OPEN',
              reviewerRole: 'EVALUADOR',
              createdAt: '2026-07-20T00:00:00Z',
            },
          ];
        }
        if (url.includes('/api/observations/50/remedies')) {
          return [
            {
              id: 80,
              observationId: 50,
              applicantId: 2,
              description: 'Recalculated',
              attachedDocumentId: 12,
              createdAt: '2026-07-20T10:00:00Z',
            },
          ];
        }
        return null;
      });

      const result = await tramiteService.getObservacionesByTramite(101);

      expect(mockApi.get).toHaveBeenCalledWith('/api/observations/procedure/101');
      expect(mockApi.get).toHaveBeenCalledWith('/api/observations/50/remedies');
      expect(result).toEqual([
        {
          id: 50,
          idTramite: 101,
          tipoObservacion: 'TECHNICAL',
          descripcion: 'Wrong calculations',
          estadoObservacion: 'OPEN',
          rolRevisor: 'EVALUADOR',
          fechaRegistro: '2026-07-20T00:00:00Z',
          subsanaciones: [
            {
              id: 80,
              idObservacion: 50,
              idSolicitante: 2,
              descripcion: 'Recalculated',
              nombreDocumentoAdjunto: 12,
              fechaRegistro: '2026-07-20T10:00:00Z',
            },
          ],
        },
      ]);
    });

    it('returns empty array if observations fetch fails or is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await tramiteService.getObservacionesByTramite(101);
      expect(result).toEqual([]);
    });

    it('ignores remedy fetch error and returns observation with empty remedies list', async () => {
      mockApi.get.mockImplementation(async (url: string) => {
        if (url.includes('/api/observations/procedure/')) {
          return [
            {
              id: 50,
              procedureId: 101,
              type: 'TECHNICAL',
              description: 'Wrong calculations',
              status: 'OPEN',
              reviewerRole: 'EVALUADOR',
              createdAt: '2026-07-20T00:00:00Z',
            },
          ];
        }
        if (url.includes('/api/observations/50/remedies')) {
          throw new Error('API down');
        }
        return null;
      });

      const result = await tramiteService.getObservacionesByTramite(101);
      expect(result[0].subsanaciones).toEqual([]);
    });
  });

  describe('state-changing put operations', () => {
    it('approve calls PUT /api/v1/procedures/:id/approve', async () => {
      mockApi.put.mockResolvedValue({ id: 101 });
      const result = await tramiteService.approve(101);
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/procedures/101/approve');
      expect(result.id).toBe(101);
    });

    it('flag calls PUT /api/v1/procedures/:id/flag with request body', async () => {
      mockApi.put.mockResolvedValue({ id: 101 });
      await tramiteService.flag(101, 'Please check this', 14);
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/procedures/101/flag', {
        textoObservacion: 'Please check this',
        attachedDocumentId: 14,
      });
    });

    it('reject calls PUT /api/v1/procedures/:id/reject', async () => {
      mockApi.put.mockResolvedValue({ id: 101 });
      await tramiteService.reject(101);
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/procedures/101/reject');
    });

    it('remediate calls PUT /api/v1/procedures/:id/remediate', async () => {
      mockApi.put.mockResolvedValue({ id: 101 });
      await tramiteService.remediate(101, 'Detail...');
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/procedures/101/remediate', {
        detalleSubsanacion: 'Detail...',
      });
    });

    it('registerResolution calls PUT /api/v1/procedures/:id/resolution', async () => {
      mockApi.put.mockResolvedValue({ id: 101 });
      await tramiteService.registerResolution(101);
      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/procedures/101/resolution');
    });
  });

  describe('subsanarObservacion', () => {
    it('uploads file if provided, fetches user from localStorage, and posts remedy', async () => {
      const file = new File(['content'], 'remedy.pdf', { type: 'application/pdf' });
      mockDocService.upload.mockResolvedValue({ id: 99, originalName: 'remedy.pdf', extension: 'pdf' });
      localStorage.setItem('sgi_user', JSON.stringify({ id: 42, firstNames: 'Alice' }));
      mockApi.post.mockResolvedValue(undefined);

      await tramiteService.subsanarObservacion(50, 'Updated content', file);

      expect(mockDocService.upload).toHaveBeenCalledWith(file);
      expect(mockApi.post).toHaveBeenCalledWith('/api/observations/50/remedy', {
        applicantId: 42,
        description: 'Updated content',
        attachedDocumentId: 99,
      });
    });

    it('handles null file and fallback applicant ID when localStorage is empty', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await tramiteService.subsanarObservacion(50, 'Updated content without file', null);

      expect(mockDocService.upload).not.toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith('/api/observations/50/remedy', {
        applicantId: 1, // Fallback ID
        description: 'Updated content without file',
        attachedDocumentId: undefined,
      });
    });
  });
});
