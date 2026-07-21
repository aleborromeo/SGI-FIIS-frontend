import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi, documentService } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
  documentService: { upload: vi.fn() },
}));

vi.mock('./api', () => ({ api, fetchApi }));
vi.mock('./documentService', () => ({ documentService }));

import { tramiteService, PENDING_STATE_BY_ROLE } from './tramiteService';

describe('tramiteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue([]);
    api.put.mockResolvedValue({ id: 1, code: 'T1', procedureType: 'PROYECTO', applicantId: 2, currentStatus: 'REGISTRADO', currentReviewerRole: 'COORDINADOR_GRUPO', sentAt: '2026', updatedAt: '2026' });
  });

  it('mapea PENDING_STATE_BY_ROLE correctamente', () => {
    expect(PENDING_STATE_BY_ROLE['COORDINADOR_GRUPO']).toBe('PENDIENTE_COORDINADOR');
    expect(PENDING_STATE_BY_ROLE['DIRECTOR_INVESTIGACION']).toBe('PENDIENTE_DIRECCION');
    expect(PENDING_STATE_BY_ROLE['DECANO']).toBe('PENDIENTE_DECANATO');
  });

  it('getMyProcedures mapea la respuesta', async () => {
    api.get.mockResolvedValue([{ id: 1, code: 'T1', procedureType: 'PROYECTO', applicantId: 2, currentStatus: 'REGISTRADO', currentReviewerRole: 'COORDINADOR_GRUPO', sentAt: '2026', updatedAt: '2026' }]);
    const res = await tramiteService.getMyProcedures();
    expect(api.get).toHaveBeenCalledWith('/api/v1/procedures');
    expect(res[0].codigoTramite).toBe('T1');
    expect(res[0].tipoTramite).toBe('PROYECTO');
  });

  it('getPendingForRole pasa role como param', async () => {
    api.get.mockResolvedValue([]);
    await tramiteService.getPendingForRole('DECANO');
    expect(api.get).toHaveBeenCalledWith('/api/v1/procedures', { params: { role: 'DECANO' } });
  });

  it('getById arma la url', async () => {
    await tramiteService.getById(7);
    expect(api.get).toHaveBeenCalledWith('/api/v1/procedures/7');
  });

  it('getTraceability mapea movimientos', async () => {
    api.get.mockResolvedValue([{ actionUserId: 9, action: 'APROBAR', previousStatus: 'A', newStatus: 'B', comment: 'ok', movementAt: '2026' }]);
    const mov = await tramiteService.getTraceability(7);
    expect(api.get).toHaveBeenCalledWith('/api/v1/procedures/7/traceability');
    expect(mov[0].idTramite).toBe(7);
    expect(mov[0].accion).toBe('APROBAR');
  });

  it('getObservacionesByTramite mapea observaciones y subsanaciones', async () => {
    api.get
      .mockResolvedValueOnce([{ id: 1, procedureId: 2, type: 'TECNICA', description: 'd', status: 'PENDIENTE', reviewerRole: 'X', createdAt: '2026' }])
      .mockResolvedValueOnce([{ id: 10, observationId: 1, applicantId: 3, description: 's', attachedDocumentId: 5, createdAt: '2026' }]);
    const obs = await tramiteService.getObservacionesByTramite(2);
    expect(api.get).toHaveBeenCalledWith('/api/observations/procedure/2');
    expect(obs[0].tipoObservacion).toBe('TECNICA');
    expect(obs[0].subsanaciones).toHaveLength(1);
    expect(obs[0].subsanaciones[0].id).toBe(10);
  });

  it('approve, flag, reject, remediate, registerResolution usan PUT a sus endpoints', async () => {
    await tramiteService.approve(7);
    expect(api.put).toHaveBeenCalledWith('/api/v1/procedures/7/approve');

    await tramiteService.flag(7, 'obs', 3);
    expect(api.put).toHaveBeenCalledWith('/api/v1/procedures/7/flag', { textoObservacion: 'obs', attachedDocumentId: 3 });

    await tramiteService.reject(7);
    expect(api.put).toHaveBeenCalledWith('/api/v1/procedures/7/reject');

    await tramiteService.remediate(7, 'det');
    expect(api.put).toHaveBeenCalledWith('/api/v1/procedures/7/remediate', { detalleSubsanacion: 'det' });

    await tramiteService.registerResolution(7);
    expect(api.put).toHaveBeenCalledWith('/api/v1/procedures/7/resolution');
  });

  it('subsanarObservacion sube documento cuando hay file y lee sgi_user', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ id: 42 }));
    documentService.upload.mockResolvedValue({ id: 99 });
    api.post.mockResolvedValue(undefined);
    const file = new File(['x'], 'doc.pdf');
    await tramiteService.subsanarObservacion(5, 'desc', file);
    expect(documentService.upload).toHaveBeenCalledWith(file);
    expect(api.post).toHaveBeenCalledWith('/api/observations/5/remedy', {
      applicantId: 42,
      description: 'desc',
      attachedDocumentId: 99,
    });
  });

  it('subsanarObservacion sin file no sube documento', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ id: 42 }));
    api.post.mockResolvedValue(undefined);
    await tramiteService.subsanarObservacion(5, 'desc', null);
    expect(documentService.upload).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith('/api/observations/5/remedy', {
      applicantId: 42,
      description: 'desc',
      attachedDocumentId: undefined,
    });
  });
});
