import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleProtectedRoute from './RoleProtectedRoute';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('RoleProtectedRoute', () => {
  const renderWithContext = (currentRole: string | null, allowedRoles: string[], fallbackPath?: string) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ currentRole } as any}>
          <ToastProvider>
            <Routes>
              <Route
                path="/protected"
                element={
                  <RoleProtectedRoute allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
                    <div data-testid="protected-content">Protected Content</div>
                  </RoleProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
              <Route path="/custom-fallback" element={<div data-testid="fallback">Custom Fallback</div>} />
            </Routes>
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders children if user role is allowed', () => {
    renderWithContext('ADMIN', ['ADMIN', 'COORDINADOR']);

    expect(screen.getByTestId('protected-content')).toBeDefined();
    expect(screen.queryByTestId('dashboard')).toBeNull();
  });

  it('redirects to default dashboard fallback and triggers toast if role not allowed', async () => {
    renderWithContext('ESTUDIANTE', ['ADMIN', 'COORDINADOR']);

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('dashboard')).toBeDefined();
    
    // Toast should show accessDeniedMessage
    expect(await screen.findByText('No tiene permisos para acceder a esta sección del sistema.')).toBeDefined();
  });

  it('redirects to custom fallback if provided and user role is null', async () => {
    renderWithContext(null, ['ADMIN'], '/custom-fallback');

    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByTestId('fallback')).toBeDefined();
    
    // Toast should show accessDeniedMessage
    expect(await screen.findByText('No tiene permisos para acceder a esta sección del sistema.')).toBeDefined();
  });
});
