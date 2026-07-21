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

import { resolutionService } from './resolutionService';
import { api } from './api';
import { documentService } from './documentService';

const mockApi = vi.mocked(api);
const mockDocService = vi.mocked(documentService);

describe('resolutionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getByProcedureId', () => {
    it('calls GET /api/v1/resolutions/procedure/:id and returns resolution', async () => {
      const mockResolution = { id: 1, number: 'RES-001' };
      mockApi.get.mockResolvedValue(mockResolution);

      const result = await resolutionService.getByProcedureId(10);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/resolutions/procedure/10');
      expect(result).toEqual(mockResolution);
    });

    it('returns null if request fails', async () => {
      mockApi.get.mockRejectedValue(new Error('API Error'));

      const result = await resolutionService.getByProcedureId(10);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/resolutions/procedure/10');
      expect(result).toBeNull();
    });
  });

  describe('uploadAttachment', () => {
    it('uploads file and returns doc id', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      mockDocService.upload.mockResolvedValue({ id: 50, originalName: 'test.pdf', extension: 'pdf' });

      const result = await resolutionService.uploadAttachment(file);

      expect(mockDocService.upload).toHaveBeenCalledWith(file);
      expect(result).toBe(50);
    });
  });

  describe('issueResolution', () => {
    it('calls POST /api/v1/resolutions with FormData', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { success: true, timestamp: '123', message: 'Ok', data: {} };
      mockApi.post.mockResolvedValue(mockResponse);

      const input = {
        numeroResolucion: 'RES-100',
        fechaEmision: '2026-07-20',
        asunto: 'Approval',
        idTramite: 5,
        file,
      };

      const result = await resolutionService.issueResolution(input);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/resolutions', expect.any(FormData));
      
      const [endpoint, formData] = mockApi.post.mock.calls[0] as [string, FormData];
      expect(endpoint).toBe('/api/v1/resolutions');
      expect(formData.get('numeroResolucion')).toBe('RES-100');
      expect(formData.get('fechaEmision')).toBe('2026-07-20');
      expect(formData.get('asunto')).toBe('Approval');
      expect(formData.get('idTramite')).toBe('5');
      expect(formData.get('archivo')).toBe(file);
      
      expect(result).toEqual(mockResponse);
    });
  });
});
