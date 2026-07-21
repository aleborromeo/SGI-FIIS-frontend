import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  fetchApi: vi.fn(),
}));

import { documentService } from './documentService';
import { api, fetchApi } from './api';

const mockApi = vi.mocked(api);
const mockFetchApi = vi.mocked(fetchApi);

describe('documentService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    // Mock window.URL methods
    window.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('uploadDocument & upload', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    it('uploadDocument calls fetchApi POST with FormData', async () => {
      mockFetchApi.mockResolvedValue({ id: 1, originalName: 'hello.txt', extension: 'txt' });

      const result = await documentService.uploadDocument(file);

      expect(mockFetchApi).toHaveBeenCalledWith('/api/documents/upload', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }));
      expect(result).toEqual({ id: 1, originalName: 'hello.txt', extension: 'txt' });
    });

    it('upload calls fetchApi POST with FormData', async () => {
      mockFetchApi.mockResolvedValue({ id: 2, originalName: 'hello.txt', extension: 'txt' });

      const result = await documentService.upload(file);

      expect(mockFetchApi).toHaveBeenCalledWith('/api/documents/upload', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }));
      expect(result).toEqual({ id: 2, originalName: 'hello.txt', extension: 'txt' });
    });
  });

  describe('list', () => {
    it('calls GET /api/documents and maps result correctly', async () => {
      const mockRawDocs = [
        {
          id: 1,
          originalName: 'test.pdf',
          fileUrl: '/url/1',
          extension: 'pdf',
          sizeBytes: 1024,
          uploadedById: 10,
          uploadDate: '2026-07-20T00:00:00Z',
          active: true,
        },
      ];
      mockApi.get.mockResolvedValue(mockRawDocs);

      const result = await documentService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/api/documents');
      expect(result).toEqual([
        {
          id: 1,
          fileName: 'test.pdf',
          fileUrl: '/url/1',
          fileType: 'pdf',
          fileSize: 1024,
          uploadedBy: 10,
          uploadedAt: '2026-07-20T00:00:00Z',
          active: true,
        },
      ]);
    });

    it('handles alternative property names and defaults in mapping', async () => {
      const mockRawDocs = [
        {
          id: 2,
          fileName: 'backup.zip',
          fileType: 'zip',
          fileSize: 2048,
          uploadedBy: 11,
          uploadedAt: '2026-07-20T01:00:00Z',
        },
      ];
      mockApi.get.mockResolvedValue(mockRawDocs);

      const result = await documentService.list();

      expect(result).toEqual([
        {
          id: 2,
          fileName: 'backup.zip',
          fileUrl: '',
          fileType: 'zip',
          fileSize: 2048,
          uploadedBy: 11,
          uploadedAt: '2026-07-20T01:00:00Z',
          active: undefined,
        },
      ]);
    });

    it('returns empty array if response is not an array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await documentService.list();
      expect(result).toEqual([]);
    });
  });

  describe('download', () => {
    it('returns download URL format', () => {
      const result = documentService.download(5);
      expect(result).toContain('/api/documents/download/5');
    });
  });

  describe('downloadFile', () => {
    it('downloads file successfully using fetch and triggers link download', async () => {
      localStorage.setItem('sgi_token', 'Bearer mock-token');

      const mockBlob = new Blob(['content'], { type: 'text/plain' });
      const mockFetchResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        status: 200,
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      // Spy on document.createElement and anchor element interactions
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      } as any;
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

      await documentService.downloadFile(12, 'hello-world.txt');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/documents/download/12'),
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('mock-blob-url');
      expect(mockAnchor.download).toBe('hello-world.txt');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('uses fallback file name when no file name is provided', async () => {
      const mockBlob = new Blob(['content'], { type: 'text/plain' });
      const mockFetchResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        status: 200,
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      } as any;
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

      await documentService.downloadFile(12);

      expect(mockAnchor.download).toBe('documento_12');
    });

    it('throws error when response is not ok', async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
      };
      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      await expect(documentService.downloadFile(12)).rejects.toThrow('Error al descargar (500)');
    });
  });

  describe('getViewUrl', () => {
    it('returns view URL with token when token is present', () => {
      localStorage.setItem('token', 'token-abc');
      const result = documentService.getViewUrl(8);
      expect(result).toContain('/api/documents/view/8?token=token-abc');
    });

    it('returns view URL without token when token is absent', () => {
      const result = documentService.getViewUrl(9);
      expect(result).toBe(`${import.meta.env.VITE_API_URL || ''}/api/documents/view/9`);
    });
  });

  describe('deactivate', () => {
    it('calls fetchApi DELETE /api/documents/deactivate/:id', async () => {
      mockFetchApi.mockResolvedValue(undefined);

      await documentService.deactivate(10);

      expect(mockFetchApi).toHaveBeenCalledWith('/api/documents/deactivate/10', {
        method: 'DELETE',
      });
    });
  });
});
