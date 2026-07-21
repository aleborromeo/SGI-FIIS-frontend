import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi, documentService } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
  documentService: { upload: vi.fn() },
}));

vi.mock('./api', () => ({ api, fetchApi }));
vi.mock('./documentService', () => ({ documentService }));

import { resolutionService } from './resolutionService';

describe('resolutionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ id: 1 });
    api.post.mockResolvedValue({ success: true });
    documentService.upload.mockResolvedValue({ id: 7 });
  });

  it('getByProcedureId retorna la resolucion', async () => {
    const r = await resolutionService.getByProcedureId(3);
    expect(api.get).toHaveBeenCalledWith('/api/v1/resolutions/procedure/3');
    expect(r).toEqual({ id: 1 });
  });

  it('getByProcedureId retorna null si falla', async () => {
    api.get.mockRejectedValue(new Error('404'));
    expect(await resolutionService.getByProcedureId(3)).toBeNull();
  });

  it('uploadAttachment sube el documento y retorna el id', async () => {
    const file = new File(['x'], 'r.pdf');
    const id = await resolutionService.uploadAttachment(file);
    expect(documentService.upload).toHaveBeenCalledWith(file);
    expect(id).toBe(7);
  });

  it('issueResolution arma FormData con archivo', async () => {
    const file = new File(['x'], 'r.pdf');
    await resolutionService.issueResolution({
      numeroResolucion: 'R-1',
      fechaEmision: '2026-01-01',
      asunto: 'Asunto',
      idTramite: 3,
      file,
    });
    expect(api.post).toHaveBeenCalledWith('/api/v1/resolutions', expect.any(FormData));
    const fd = api.post.mock.calls[0][1] as FormData;
    expect(fd.get('numeroResolucion')).toBe('R-1');
    expect(fd.get('idTramite')).toBe('3');
    expect(fd.get('archivo')).toBe(file);
  });
});
