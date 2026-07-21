import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api, fetchApi }));

import { documentService } from './documentService';

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.get.mockResolvedValue([]);
    fetchApi.mockResolvedValue({ id: 5, originalName: 'f.pdf', extension: 'pdf' });
  });

  it('uploadDocument y upload postean FormData a /api/documents/upload', async () => {
    const file = new File(['x'], 'f.pdf');
    await documentService.uploadDocument(file);
    expect(fetchApi).toHaveBeenCalledWith('/api/documents/upload', { method: 'POST', body: expect.any(FormData) });

    await documentService.upload(file);
    expect(fetchApi).toHaveBeenCalledWith('/api/documents/upload', { method: 'POST', body: expect.any(FormData) });
  });

  it('list mapea la respuesta y retorna [] si no es array', async () => {
    api.get.mockResolvedValue([
      { id: 1, originalName: 'a.pdf', extension: 'pdf', sizeBytes: 10 },
      { id: 2, fileName: 'b.docx', fileType: 'docx' },
    ]);
    const docs = await documentService.list();
    expect(docs[0].fileName).toBe('a.pdf');
    expect(docs[0].fileType).toBe('pdf');
    expect(docs).toHaveLength(2);

    api.get.mockResolvedValue({});
    expect(await documentService.list()).toEqual([]);
  });

  it('download retorna url con base del api', () => {
    const url = documentService.download(5);
    expect(url).toContain('/api/documents/download/5');
  });

  it('getViewUrl agrega token cuando hay', () => {
    localStorage.setItem('sgi_token', 'tok');
    const url = documentService.getViewUrl(5);
    expect(url).toContain('/api/documents/view/5');
    expect(url).toContain('token=tok');
  });

  it('deactivate hace DELETE', async () => {
    await documentService.deactivate(5);
    expect(fetchApi).toHaveBeenCalledWith('/api/documents/deactivate/5', { method: 'DELETE' });
  });
});
