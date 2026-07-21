import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useContext, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Spinner } from './components/common/Spinner';

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', backgroundColor: '#f8f9fa' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', backgroundColor: '#f8f9fa' }}>
        <Spinner size="large" />
        <p style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
          Restaurando sesión segura...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

function renderPublicRoute(authValue: Record<string, any> = {}, entry = '/login') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthContext.Provider value={authValue as any}>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><div data-testid="public-children">Public Content</div></PublicRoute>} />
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            <Route path="*" element={<div data-testid="fallback">Fallback</div>} />
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

function renderProtectedRoute(authValue: Record<string, any> = {}, entry = '/protected') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthContext.Provider value={authValue as any}>
        <ToastProvider>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><div data-testid="protected-children">Protected Content</div></ProtectedRoute>} />
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            <Route path="/change-password" element={<div data-testid="change-password">Change Password</div>} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
            <Route path="*" element={<div data-testid="fallback">Fallback</div>} />
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('PublicRoute', () => {
  const baseAuth = {
    user: null,
    roles: [],
    currentRole: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading spinner when loading is true', () => {
    renderPublicRoute({ ...baseAuth, loading: true });
    expect(screen.getByLabelText('Cargando...')).toBeDefined();
    expect(screen.queryByTestId('public-children')).toBeNull();
  });

  it('redirects to /dashboard when authenticated', () => {
    renderPublicRoute({ ...baseAuth, isAuthenticated: true });
    expect(screen.queryByTestId('public-children')).toBeNull();
    expect(screen.getByTestId('dashboard')).toBeDefined();
  });

  it('renders children when not authenticated', () => {
    renderPublicRoute(baseAuth);
    expect(screen.getByTestId('public-children')).toBeDefined();
    expect(screen.getByText('Public Content')).toBeDefined();
  });
});

describe('ProtectedRoute', () => {
  const baseAuth = {
    user: { id: 1, roleCode: 'ADMIN', firstNames: 'Admin', lastNames: 'User', email: 'admin@sgi.com' },
    roles: ['ADMIN'],
    currentRole: 'ADMIN',
    loading: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading spinner when loading is true', () => {
    renderProtectedRoute({ ...baseAuth, loading: true });
    expect(screen.getByLabelText('Cargando...')).toBeDefined();
    expect(screen.getByText('Restaurando sesión segura...')).toBeDefined();
    expect(screen.queryByTestId('protected-children')).toBeNull();
  });

  it('redirects to / when not authenticated', () => {
    renderProtectedRoute({ ...baseAuth, isAuthenticated: false, user: null });
    expect(screen.queryByTestId('protected-children')).toBeNull();
    expect(screen.getByTestId('home')).toBeDefined();
  });

  it('redirects to /change-password when mustChangePassword is true', () => {
    renderProtectedRoute({
      ...baseAuth,
      user: { ...baseAuth.user, mustChangePassword: true },
    });
    expect(screen.queryByTestId('protected-children')).toBeNull();
    expect(screen.getByTestId('change-password')).toBeDefined();
  });

  it('renders children when authenticated and no mustChangePassword', () => {
    renderProtectedRoute(baseAuth);
    expect(screen.getByTestId('protected-children')).toBeDefined();
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('does not redirect when mustChangePassword is false', () => {
    renderProtectedRoute({
      ...baseAuth,
      user: { ...baseAuth.user, mustChangePassword: false },
    });
    expect(screen.getByTestId('protected-children')).toBeDefined();
    expect(screen.queryByTestId('change-password')).toBeNull();
  });
});
