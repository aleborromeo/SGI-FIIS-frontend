import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService, type CreateProjectPayload } from './projectService';

vi.mock('./api', () => ({
  fetchApi: vi.fn(),
}));

import { fetchApi } from './api';

const mockFetchApi = vi.mocked(fetchApi);

describe('projectService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('calls fetchApi with correct endpoint', async () => {
      mockFetchApi.mockResolvedValue([]);
      const result = await projectService.getAll();
      expect(mockFetchApi).toHaveBeenCalledWith('/projects');
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('calls fetchApi with project id', async () => {
      const mockProject = { id: 1, title: 'Test Project' };
      mockFetchApi.mockResolvedValue(mockProject);
      const result = await projectService.getById(1);
      expect(mockFetchApi).toHaveBeenCalledWith('/projects/1');
      expect(result).toEqual(mockProject);
    });

    it('accepts string ids', async () => {
      mockFetchApi.mockResolvedValue({ id: 'abc' });
      await projectService.getById('abc');
      expect(mockFetchApi).toHaveBeenCalledWith('/projects/abc');
    });
  });

  describe('create', () => {
    it('calls fetchApi with POST method and JSON body', async () => {
      const payload: CreateProjectPayload = {
        title: 'Test',
        summary: 'Summary',
        generalObjective: 'Objective',
      };
      mockFetchApi.mockResolvedValue({ id: 1 });
      await projectService.create(payload);
      expect(mockFetchApi).toHaveBeenCalledWith('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    });
  });

  describe('updateStatus', () => {
    it('calls fetchApi with PATCH and status query param', async () => {
      mockFetchApi.mockResolvedValue({ id: 1 });
      await projectService.updateStatus(1, 'ENVIADO');
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/projects/1/status?status=ENVIADO',
        { method: 'PATCH' }
      );
    });

    it('encodes status value', async () => {
      mockFetchApi.mockResolvedValue({ id: 1 });
      await projectService.updateStatus(5, 'PENDIENTE COORDINADOR');
      expect(mockFetchApi).toHaveBeenCalledWith(
        expect.stringContaining('status=PENDIENTE%20COORDINADOR'),
        { method: 'PATCH' }
      );
    });
  });

  describe('getMyDrafts', () => {
    it('calls fetchApi with drafts endpoint', async () => {
      mockFetchApi.mockResolvedValue([]);
      await projectService.getMyDrafts();
      expect(mockFetchApi).toHaveBeenCalledWith('/projects/drafts');
    });
  });

  describe('deleteDraft', () => {
    it('calls fetchApi with DELETE method', async () => {
      mockFetchApi.mockResolvedValue(undefined);
      await projectService.deleteDraft(42);
      expect(mockFetchApi).toHaveBeenCalledWith('/projects/42', { method: 'DELETE' });
    });
  });

  describe('uploadDocument', () => {
    it('calls fetchApi with FormData and correct endpoint', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { id: 10, fileName: 'test.pdf', fileUrl: '/files/test.pdf' };
      mockFetchApi.mockResolvedValue(mockResponse);

      const result = await projectService.uploadDocument(file);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      const [endpoint, options] = mockFetchApi.mock.calls[0];
      expect(endpoint).toBe('/api/documents/upload');
      if (!options) throw new Error('options is undefined');
      expect(options.method).toBe('POST');
      expect(options.body).toBeInstanceOf(FormData);

      const formData = options.body as FormData;
      expect(formData.get('file')).toBe(file);
      expect(result).toEqual(mockResponse);
    });

    it('propagates errors from api layer', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      mockFetchApi.mockRejectedValue(new Error('Upload failed'));

      await expect(projectService.uploadDocument(file)).rejects.toThrow('Upload failed');
    });
  });
});
