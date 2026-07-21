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

import { userService } from './userService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('calls GET /users without query', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await userService.getAll();
      expect(mockApi.get).toHaveBeenCalledWith('/users', { params: undefined });
      expect(result).toEqual([]);
    });

    it('calls GET /users with query', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await userService.getAll('search-term');
      expect(mockApi.get).toHaveBeenCalledWith('/users', { params: { query: 'search-term' } });
      expect(result).toEqual([]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await userService.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getReviewers', () => {
    it('fetches and filters reviewers correctly', async () => {
      const mockUsers = [
        { id: 1, roleCode: 'EVALUADOR', active: true },
        { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', active: true },
        { id: 3, roleCode: 'COORDINADOR_GRUPO', active: true },
        { id: 4, roleCode: 'ESTUDIANTE', active: true },
        { id: 5, roleCode: 'EVALUADOR', active: false },
      ];
      mockApi.get.mockResolvedValue(mockUsers);
      const result = await userService.getReviewers();
      expect(mockApi.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual([
        { id: 1, roleCode: 'EVALUADOR', active: true },
        { id: 2, roleCode: 'DOCENTE_INVESTIGADOR', active: true },
        { id: 3, roleCode: 'COORDINADOR_GRUPO', active: true },
      ]);
    });

    it('returns empty array if response is not array', async () => {
      mockApi.get.mockResolvedValue(null);
      const result = await userService.getReviewers();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('calls GET /users/:id', async () => {
      const mockUser = { id: 123 };
      mockApi.get.mockResolvedValue(mockUser);
      const result = await userService.getById(123);
      expect(mockApi.get).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('calls POST /users', async () => {
      const payload = { dni: '123', firstNames: 'John', lastNames: 'Doe', roleCode: 'ESTUDIANTE' };
      mockApi.post.mockResolvedValue({ id: 1 });
      const result = await userService.create(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/users', payload);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('update', () => {
    it('calls PUT /users/:id', async () => {
      const payload = { firstNames: 'John' };
      mockApi.put.mockResolvedValue({ id: 1 });
      const result = await userService.update(1, payload);
      expect(mockApi.put).toHaveBeenCalledWith('/users/1', payload);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('toggleStatus', () => {
    it('calls PATCH /users/:id/status', async () => {
      mockApi.patch.mockResolvedValue({ id: 1, active: true });
      const result = await userService.toggleStatus(1, true);
      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/status', { active: true });
      expect(result).toEqual({ id: 1, active: true });
    });
  });

  describe('rejectUser', () => {
    it('calls PATCH /users/:id/status with active: false', async () => {
      mockApi.patch.mockResolvedValue(undefined);
      await userService.rejectUser(1);
      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/status', { active: false });
    });
  });

  describe('createUser', () => {
    it('calls POST /users', async () => {
      const payload = { dni: '123', firstNames: 'John', lastNames: 'Doe', roleCode: 'ESTUDIANTE' };
      mockApi.post.mockResolvedValue({ id: 1, temporaryPassword: 'pwd' });
      const result = await userService.createUser(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/users', payload);
      expect(result).toEqual({ id: 1, temporaryPassword: 'pwd' });
    });
  });

  describe('updateUser', () => {
    it('calls PUT /users/:id', async () => {
      const payload = { firstNames: 'John', lastNames: 'Doe', institutionalEmail: 'j@d.com', roleCode: 'ESTUDIANTE' };
      mockApi.put.mockResolvedValue({ id: 1 });
      const result = await userService.updateUser(1, payload);
      expect(mockApi.put).toHaveBeenCalledWith('/users/1', payload);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('resetPassword', () => {
    it('calls PATCH /users/:id/reset-password', async () => {
      mockApi.patch.mockResolvedValue({ message: 'reset' });
      const result = await userService.resetPassword(1);
      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/reset-password');
      expect(result).toEqual({ message: 'reset' });
    });
  });
});
