import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api, fetchApi }));

import { userService } from './userService';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({ id: 1 });
    api.put.mockResolvedValue({ id: 1 });
    api.patch.mockResolvedValue({ id: 1 });
  });

  it('getAll pasa query como param', async () => {
    await userService.getAll('jorge');
    expect(api.get).toHaveBeenCalledWith('/users', { params: { query: 'jorge' } });
  });

  it('getAll sin query no pasa params', async () => {
    await userService.getAll();
    expect(api.get).toHaveBeenCalledWith('/users', { params: undefined });
  });

  it('getReviewers mapea todos los resultados con active=true', async () => {
    api.get.mockResolvedValue([
      { id: 1, active: true, roleCode: 'EVALUADOR' },
      { id: 2, active: false, roleCode: 'EVALUADOR' },
      { id: 3, active: true, roleCode: 'ADMIN' },
      { id: 4, active: true, roleCode: 'DOCENTE_INVESTIGADOR' },
    ]);
    const reviewers = await userService.getReviewers();
    expect(reviewers).toHaveLength(4);
    reviewers.forEach((r) => expect(r.active).toBe(true));
  });

  it('getReviewers retorna [] si no es array', async () => {
    api.get.mockResolvedValue(null);
    expect(await userService.getReviewers()).toEqual([]);
  });

  it('getById arma la url', async () => {
    await userService.getById(5);
    expect(api.get).toHaveBeenCalledWith('/users/5');
  });

  it('create postea a /users', async () => {
    const payload = { dni: '1', firstNames: 'A', lastNames: 'B', roleCode: 'ADMIN' };
    await userService.create(payload);
    expect(api.post).toHaveBeenCalledWith('/users', payload);
  });

  it('update hace put', async () => {
    await userService.update(3, { firstNames: 'X' });
    expect(api.put).toHaveBeenCalledWith('/users/3', { firstNames: 'X' });
  });

  it('toggleStatus manda active en el body', async () => {
    await userService.toggleStatus(3, false);
    expect(api.patch).toHaveBeenCalledWith('/users/3/status', { active: false });
  });

  it('rejectUser y activateUser usan patch con active', async () => {
    await userService.rejectUser(3);
    expect(api.patch).toHaveBeenCalledWith('/users/3/status', { active: false });
    await userService.activateUser(3);
    expect(api.patch).toHaveBeenCalledWith('/users/3/status', { active: true });
  });

  it('resetPassword hace patch al endpoint correcto', async () => {
    await userService.resetPassword(3);
    expect(api.patch).toHaveBeenCalledWith('/users/3/reset-password');
  });

  it('createUser y updateUser delegan en post/put', async () => {
    await userService.createUser({ dni: '1', firstNames: 'A', lastNames: 'B', roleCode: 'ADMIN' });
    expect(api.post).toHaveBeenCalledWith('/users', { dni: '1', firstNames: 'A', lastNames: 'B', roleCode: 'ADMIN' });

    await userService.updateUser(2, { firstNames: 'A', lastNames: 'B', institutionalEmail: 'x', roleCode: 'ADMIN' });
    expect(api.put).toHaveBeenCalledWith('/users/2', { firstNames: 'A', lastNames: 'B', institutionalEmail: 'x', roleCode: 'ADMIN' });
  });
});
