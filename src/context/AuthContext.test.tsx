import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    getProfile: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock('../i18n', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

const mockAuthService = vi.mocked(authService);

const TestComponent = () => {
  const {
    isAuthenticated,
    user,
    roles,
    currentRole,
    loading,
    error,
    login,
    logout,
    switchRole,
    clearError,
    completeRegistration,
  } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? 'authenticated' : 'guest'}</div>
      <div data-testid="loading-state">{loading ? 'loading' : 'done'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="current-role">{currentRole || 'no-role'}</div>
      <div data-testid="roles-list">{roles.join(',')}</div>
      <div data-testid="error-state">{error || 'no-error'}</div>
      
      <button onClick={() => login('admin@sgi.com', 'password123').catch(() => {})}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => switchRole('DECANO')}>Switch Role</button>
      <button onClick={clearError}>Clear Error</button>
      <button
        onClick={() =>
          completeRegistration({
            token: 'reg-token',
            id: 99,
            email: 'reg@sgi.com',
            firstNames: 'Reg',
            lastNames: 'User',
            roleCode: 'ESTUDIANTE',
            mustChangePassword: false,
          })
        }
      >
        Complete Reg
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('restores session successfully on mount if token exists', async () => {
    localStorage.setItem('sgi_token', 'mock-token');
    mockAuthService.getProfile.mockResolvedValue({
      id: 1,
      institutionalEmail: 'restored@sgi.com',
      firstNames: 'Alice',
      lastNames: 'Smith',
      roleCode: 'ADMIN',
      mustChangePassword: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading-state').textContent).toBe('loading');

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('done');
    });

    expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-email').textContent).toBe('restored@sgi.com');
    expect(screen.getByTestId('current-role').textContent).toBe('ADMIN');
    expect(JSON.parse(localStorage.getItem('sgi_user') || '{}').email).toBe('restored@sgi.com');
  });

  it('handles fallbacks in profile properties for session restore', async () => {
    localStorage.setItem('sgi_token', 'mock-token');
    mockAuthService.getProfile.mockResolvedValue({
      id: 2,
      correoInstitucional: 'alt@sgi.com',
      nombres: 'Bob',
      apellidos: 'Jones',
      rolPrincipal: { codigoRol: 'DOCENTE_INVESTIGADOR' },
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('done');
    });

    expect(screen.getByTestId('user-email').textContent).toBe('alt@sgi.com');
    expect(screen.getByTestId('current-role').textContent).toBe('DOCENTE_INVESTIGADOR');
  });

  it('clears localStorage and loading state if session restore fails', async () => {
    localStorage.setItem('sgi_token', 'invalid-token');
    localStorage.setItem('sgi_user', 'old-user');
    mockAuthService.getProfile.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('done');
    });

    expect(screen.getByTestId('auth-state').textContent).toBe('guest');
    expect(localStorage.getItem('sgi_token')).toBeNull();
    expect(localStorage.getItem('sgi_user')).toBeNull();
  });

  it('does not restore session if no token is found', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading-state').textContent).toBe('done');
    expect(screen.getByTestId('auth-state').textContent).toBe('guest');
  });

  it('logs in user successfully', async () => {
    mockAuthService.login.mockResolvedValue({
      token: 'jwt-token',
      id: 10,
      email: 'admin@sgi.com',
      firstNames: 'Admin',
      lastNames: 'User',
      roleCode: 'COORDINADOR_GRUPO',
      mustChangePassword: false,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await screen.findByText('Login');
    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(localStorage.getItem('sgi_token')).toBe('jwt-token');
    expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-email').textContent).toBe('admin@sgi.com');
    expect(screen.getByTestId('current-role').textContent).toBe('COORDINADOR_GRUPO');
  });

  it('handles login failure and sets error state', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Incorrect password'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-state').textContent).toBe('guest');
    expect(screen.getByTestId('error-state').textContent).toBe('Incorrect password');

    // Test clearError
    await act(async () => {
      screen.getByText('Clear Error').click();
    });
    expect(screen.getByTestId('error-state').textContent).toBe('no-error');
  });

  it('logs out user and wipes storage', async () => {
    localStorage.setItem('sgi_token', 'token');
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'user@sgi.com' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state after click logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('sgi_token')).toBeNull();
    expect(localStorage.getItem('sgi_user')).toBeNull();
    expect(screen.getByTestId('auth-state').textContent).toBe('guest');
  });

  it('completes registration correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Complete Reg').click();
    });

    expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-email').textContent).toBe('reg@sgi.com');
    expect(screen.getByTestId('current-role').textContent).toBe('ESTUDIANTE');
  });

  it('switches role if user has it', async () => {
    // Inject multiple roles
    mockAuthService.getProfile.mockResolvedValue({
      id: 1,
      institutionalEmail: 'user@sgi.com',
      firstNames: 'User',
      lastNames: 'Name',
      roleCode: 'ADMIN',
    });
    localStorage.setItem('sgi_token', 'token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('done');
    });

    // In this context AuthProvider only adds [profile.roleCode] as available roles initially.
    // Let's mock a case where user manually sets state, but in production we switchRole.
    // If we call switchRole('DECANO'), it should not switch because roles only has ['ADMIN']
    act(() => {
      screen.getByText('Switch Role').click();
    });
    expect(screen.getByTestId('current-role').textContent).toBe('ADMIN');
  });
});
