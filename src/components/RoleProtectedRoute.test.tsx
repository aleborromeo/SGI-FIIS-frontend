import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import RoleProtectedRoute from './RoleProtectedRoute';

function makeContext(currentRole: string | null) {
  return {
    isAuthenticated: true,
    user: null,
    roles: currentRole ? [currentRole] : [],
    currentRole,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
  } as any;
}

function renderRoute(currentRole: string | null, allowedRoles: string[]) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={makeContext(currentRole)}>
        <ToastProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <RoleProtectedRoute allowedRoles={allowedRoles} fallbackPath="/dashboard">
                  <div>SECRETO</div>
                </RoleProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<div>DASHBOARD</div>} />
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('RoleProtectedRoute', () => {
  it('renderiza children cuando el rol esta permitido', () => {
    renderRoute('ADMIN', ['ADMIN']);
    expect(screen.getByText('SECRETO')).toBeInTheDocument();
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
  });

  it('redirige al fallback y muestra toast cuando el rol no esta permitido', async () => {
    renderRoute('ESTUDIANTE', ['ADMIN']);
    expect(screen.queryByText('SECRETO')).not.toBeInTheDocument();
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(await screen.findByText(/no tiene permisos/i)).toBeInTheDocument();
  });

  it('redirige cuando no hay rol (no autenticado)', () => {
    renderRoute(null, ['ADMIN']);
    expect(screen.queryByText('SECRETO')).not.toBeInTheDocument();
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
  });
});
