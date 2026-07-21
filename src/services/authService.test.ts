import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api, fetchApi } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  fetchApi: vi.fn(),
}));

vi.mock('./api', () => ({ api, fetchApi }));

import { authService } from './authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockResolvedValue({ token: 't' });
    api.get.mockResolvedValue({ id: 1 });
  });

  it('login envia email y password al endpoint /auth/login', async () => {
    await authService.login('a@b.com', 'pw');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pw' });
  });

  it('getProfile llama /auth/profile', async () => {
    await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('getDashboardData es generico sobre /dashboard/me', async () => {
    await authService.getDashboardData<{ x: number }>();
    expect(api.get).toHaveBeenCalledWith('/dashboard/me');
  });

  it('register postea a /auth/register', async () => {
    const data = { email: 'a@b.com' };
    await authService.register(data);
    expect(api.post).toHaveBeenCalledWith('/auth/register', data);
  });

  it('verifyRegistration, resendCode, forgotPassword, resetPassword usan sus endpoints', async () => {
    await authService.verifyRegistration('a@b.com', '123');
    expect(api.post).toHaveBeenCalledWith('/auth/verify-registration', { email: 'a@b.com', code: '123' });

    await authService.resendCode('a@b.com');
    expect(api.post).toHaveBeenCalledWith('/auth/resend-code', { email: 'a@b.com' });

    await authService.forgotPassword('a@b.com');
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.com' });

    await authService.resetPassword({ token: 'x' });
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token: 'x' });
  });
});
