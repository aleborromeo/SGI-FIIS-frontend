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

import { authService } from './authService';
import { api } from './api';

const mockApi = vi.mocked(api);

describe('authService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls login endpoint with credentials', async () => {
    const mockResponse = { token: 'token123', user: {} };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.login('test@test.com', 'password123');

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls getProfile endpoint', async () => {
    const mockProfile = { id: 1, email: 'test@test.com' };
    mockApi.get.mockResolvedValue(mockProfile);

    const result = await authService.getProfile();

    expect(mockApi.get).toHaveBeenCalledWith('/auth/profile');
    expect(result).toEqual(mockProfile);
  });

  it('calls getDashboardData endpoint', async () => {
    const mockDashboard = { metrics: {} };
    mockApi.get.mockResolvedValue(mockDashboard);

    const result = await authService.getDashboardData();

    expect(mockApi.get).toHaveBeenCalledWith('/dashboard/me');
    expect(result).toEqual(mockDashboard);
  });

  it('calls register endpoint', async () => {
    const mockResponse = { message: 'registered' };
    mockApi.post.mockResolvedValue(mockResponse);

    const payload = { email: 'test@test.com', password: 'password123' };
    const result = await authService.register(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(mockResponse);
  });

  it('calls verifyRegistration endpoint', async () => {
    const mockResponse = { token: 'token123', user: {} };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.verifyRegistration('test@test.com', '123456');

    expect(mockApi.post).toHaveBeenCalledWith('/auth/verify-registration', {
      email: 'test@test.com',
      code: '123456',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls resendCode endpoint', async () => {
    const mockResponse = { message: 'code sent' };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.resendCode('test@test.com');

    expect(mockApi.post).toHaveBeenCalledWith('/auth/resend-code', {
      email: 'test@test.com',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls forgotPassword endpoint', async () => {
    const mockResponse = { message: 'email sent' };
    mockApi.post.mockResolvedValue(mockResponse);

    const result = await authService.forgotPassword('test@test.com');

    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@test.com',
    });
    expect(result).toEqual(mockResponse);
  });

  it('calls resetPassword endpoint', async () => {
    const mockResponse = { message: 'password reset' };
    mockApi.post.mockResolvedValue(mockResponse);

    const payload = { token: '123', newPassword: 'abc' };
    const result = await authService.resetPassword(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', payload);
    expect(result).toEqual(mockResponse);
  });
});
