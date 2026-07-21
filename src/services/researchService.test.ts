import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api, fetchApi }));

import { researchService } from './researchService';

describe('researchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({ id: 1 });
    api.put.mockResolvedValue({ id: 1 });
    api.patch.mockResolvedValue({ id: 1 });
  });

  it('getLines incluye onlyActive en la query', async () => {
    await researchService.getLines(true);
    expect(api.get).toHaveBeenCalledWith('/research-lines?onlyActive=true');
    await researchService.getLines(false);
    expect(api.get).toHaveBeenCalledWith('/research-lines?onlyActive=false');
  });

  it('getLineById arma la url', async () => {
    await researchService.getLineById(3);
    expect(api.get).toHaveBeenCalledWith('/research-lines/3');
  });

  it('createLine/updateLine/changeLineStatus usan sus verbos', async () => {
    await researchService.createLine({ lineName: 'X' });
    expect(api.post).toHaveBeenCalledWith('/research-lines', { lineName: 'X' });

    await researchService.updateLine(3, { lineName: 'Y' });
    expect(api.put).toHaveBeenCalledWith('/research-lines/3', { lineName: 'Y' });

    await researchService.changeLineStatus(3, false);
    expect(api.patch).toHaveBeenCalledWith('/research-lines/3/status', { active: false });
  });

  it('getGroupsByLine, assignGroupToLine, removeGroupFromLine usan endpoints de linea', async () => {
    await researchService.getGroupsByLine(3);
    expect(api.get).toHaveBeenCalledWith('/research-lines/3/groups');

    await researchService.assignGroupToLine(3, 4);
    expect(api.post).toHaveBeenCalledWith('/research-lines/3/groups/4', {});

    await researchService.removeGroupFromLine(3, 4);
    expect(api.delete).toHaveBeenCalledWith('/research-lines/3/groups/4');
  });

  it('getGroups, getGroupById, createGroup, updateGroup, deactivateGroup, assignCoordinator usan endpoints de grupo', async () => {
    await researchService.getGroups();
    expect(api.get).toHaveBeenCalledWith('/research-groups');

    await researchService.getGroupById(4);
    expect(api.get).toHaveBeenCalledWith('/research-groups/4');

    await researchService.createGroup({ groupCode: 'G', groupName: 'N' });
    expect(api.post).toHaveBeenCalledWith('/research-groups', { groupCode: 'G', groupName: 'N' });

    await researchService.updateGroup(4, { groupCode: 'G', groupName: 'N' });
    expect(api.put).toHaveBeenCalledWith('/research-groups/4', { groupCode: 'G', groupName: 'N' });

    await researchService.deactivateGroup(4);
    expect(api.patch).toHaveBeenCalledWith('/research-groups/4/status', { active: false });

    await researchService.assignCoordinator(4, 9);
    expect(api.patch).toHaveBeenCalledWith('/research-groups/4/coordinator', { userId: 9 });
  });

  it('getMembers, addMember, removeMember usan endpoints de miembros', async () => {
    await researchService.getMembers(4);
    expect(api.get).toHaveBeenCalledWith('/research-groups/4/members');

    await researchService.addMember(4, 9);
    expect(api.post).toHaveBeenCalledWith('/research-groups/4/members', { userId: 9 });

    await researchService.removeMember(4, 9);
    expect(api.delete).toHaveBeenCalledWith('/research-groups/4/members/9');
  });

  it('getAvailableUsers y getCoordinatorCandidates usan sus endpoints', async () => {
    await researchService.getAvailableUsers();
    expect(api.get).toHaveBeenCalledWith('/research-groups/available-users');

    await researchService.getCoordinatorCandidates();
    expect(api.get).toHaveBeenCalledWith('/research-groups/coordinator-candidates');
  });

  it('getGroupLines y getGroupByUser usan sus endpoints', async () => {
    await researchService.getGroupLines(4);
    expect(api.get).toHaveBeenCalledWith('/research-groups/4/lines');

    api.get.mockRejectedValue(new Error('404'));
    const r = await researchService.getGroupByUser(9);
    expect(r).toBeNull();
  });
});
