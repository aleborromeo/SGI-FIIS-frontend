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

import { researchService } from './researchService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('researchService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getLines', () => {
    it('calls GET /research-lines with default onlyActive=false', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getLines();
      expect(mockApi.get).toHaveBeenCalledWith('/research-lines?onlyActive=false');
      expect(result).toEqual([]);
    });

    it('calls GET /research-lines with onlyActive=true', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getLines(true);
      expect(mockApi.get).toHaveBeenCalledWith('/research-lines?onlyActive=true');
      expect(result).toEqual([]);
    });
  });

  describe('getLineById', () => {
    it('calls GET /research-lines/:id', async () => {
      const mockLine = { id: 1, lineName: 'Line 1', active: true };
      mockApi.get.mockResolvedValue(mockLine);
      const result = await researchService.getLineById(1);
      expect(mockApi.get).toHaveBeenCalledWith('/research-lines/1');
      expect(result).toEqual(mockLine);
    });
  });

  describe('createLine', () => {
    it('calls POST /research-lines', async () => {
      const payload = { lineName: 'New Line' };
      mockApi.post.mockResolvedValue({ id: 1, ...payload, active: true });
      const result = await researchService.createLine(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/research-lines', payload);
      expect(result).toEqual({ id: 1, ...payload, active: true });
    });
  });

  describe('updateLine', () => {
    it('calls PUT /research-lines/:id', async () => {
      const payload = { lineName: 'Updated Line' };
      mockApi.put.mockResolvedValue({ id: 1, ...payload, active: true });
      const result = await researchService.updateLine(1, payload);
      expect(mockApi.put).toHaveBeenCalledWith('/research-lines/1', payload);
      expect(result).toEqual({ id: 1, ...payload, active: true });
    });
  });

  describe('changeLineStatus', () => {
    it('calls PATCH /research-lines/:id/status', async () => {
      mockApi.patch.mockResolvedValue({ id: 1, lineName: 'Line', active: false });
      const result = await researchService.changeLineStatus(1, false);
      expect(mockApi.patch).toHaveBeenCalledWith('/research-lines/1/status', { active: false });
      expect(result.active).toBe(false);
    });
  });

  describe('getGroupsByLine', () => {
    it('calls GET /research-lines/:id/groups', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getGroupsByLine(1);
      expect(mockApi.get).toHaveBeenCalledWith('/research-lines/1/groups');
      expect(result).toEqual([]);
    });
  });

  describe('assignGroupToLine', () => {
    it('calls POST /research-lines/:lineId/groups/:groupId', async () => {
      mockApi.post.mockResolvedValue(undefined);
      await researchService.assignGroupToLine(1, 5);
      expect(mockApi.post).toHaveBeenCalledWith('/research-lines/1/groups/5', {});
    });
  });

  describe('removeGroupFromLine', () => {
    it('calls DELETE /research-lines/:lineId/groups/:groupId', async () => {
      mockApi.delete.mockResolvedValue(undefined);
      await researchService.removeGroupFromLine(1, 5);
      expect(mockApi.delete).toHaveBeenCalledWith('/research-lines/1/groups/5');
    });
  });

  describe('getGroups', () => {
    it('calls GET /research-groups', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getGroups();
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups');
      expect(result).toEqual([]);
    });
  });

  describe('getGroupById', () => {
    it('calls GET /research-groups/:id', async () => {
      const mockGroup = { id: 5, groupCode: 'G5', groupName: 'Group 5', active: true };
      mockApi.get.mockResolvedValue(mockGroup);
      const result = await researchService.getGroupById(5);
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups/5');
      expect(result).toEqual(mockGroup);
    });
  });

  describe('createGroup', () => {
    it('calls POST /research-groups', async () => {
      const payload = { groupCode: 'G5', groupName: 'Group 5' };
      mockApi.post.mockResolvedValue({ id: 5, ...payload, active: true });
      const result = await researchService.createGroup(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/research-groups', payload);
      expect(result).toEqual({ id: 5, ...payload, active: true });
    });
  });

  describe('updateGroup', () => {
    it('calls PUT /research-groups/:id', async () => {
      const payload = { groupCode: 'G5', groupName: 'Updated Group' };
      mockApi.put.mockResolvedValue({ id: 5, ...payload, active: true });
      const result = await researchService.updateGroup(5, payload);
      expect(mockApi.put).toHaveBeenCalledWith('/research-groups/5', payload);
      expect(result).toEqual({ id: 5, ...payload, active: true });
    });
  });

  describe('deactivateGroup', () => {
    it('calls PATCH /research-groups/:id/status with active: false', async () => {
      mockApi.patch.mockResolvedValue({ id: 5, groupCode: 'G5', groupName: 'G', active: false });
      const result = await researchService.deactivateGroup(5);
      expect(mockApi.patch).toHaveBeenCalledWith('/research-groups/5/status', { active: false });
      expect(result.active).toBe(false);
    });
  });

  describe('assignCoordinator', () => {
    it('calls PATCH /research-groups/:id/coordinator', async () => {
      mockApi.patch.mockResolvedValue({ id: 5, groupCode: 'G5', groupName: 'G', active: true, currentCoordinatorId: 10 });
      const result = await researchService.assignCoordinator(5, 10);
      expect(mockApi.patch).toHaveBeenCalledWith('/research-groups/5/coordinator', { userId: 10 });
      expect(result.currentCoordinatorId).toBe(10);
    });
  });

  describe('getMembers', () => {
    it('calls GET /research-groups/:id/members', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getMembers(5);
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups/5/members');
      expect(result).toEqual([]);
    });
  });

  describe('addMember', () => {
    it('calls POST /research-groups/:id/members', async () => {
      mockApi.post.mockResolvedValue({ id: 1, userId: 10, active: true });
      const result = await researchService.addMember(5, 10);
      expect(mockApi.post).toHaveBeenCalledWith('/research-groups/5/members', { userId: 10 });
      expect(result).toEqual({ id: 1, userId: 10, active: true });
    });
  });

  describe('removeMember', () => {
    it('calls DELETE /research-groups/:id/members/:userId', async () => {
      mockApi.delete.mockResolvedValue({ id: 1, userId: 10, active: false });
      const result = await researchService.removeMember(5, 10);
      expect(mockApi.delete).toHaveBeenCalledWith('/research-groups/5/members/10');
      expect(result.active).toBe(false);
    });
  });

  describe('getAvailableUsers', () => {
    it('calls GET /research-groups/available-users', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getAvailableUsers();
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups/available-users');
      expect(result).toEqual([]);
    });
  });

  describe('getCoordinatorCandidates', () => {
    it('calls GET /research-groups/coordinator-candidates', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getCoordinatorCandidates();
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups/coordinator-candidates');
      expect(result).toEqual([]);
    });
  });

  describe('getGroupLines', () => {
    it('calls GET /research-groups/:id/lines', async () => {
      mockApi.get.mockResolvedValue([]);
      const result = await researchService.getGroupLines(5);
      expect(mockApi.get).toHaveBeenCalledWith('/research-groups/5/lines');
      expect(result).toEqual([]);
    });
  });
});
