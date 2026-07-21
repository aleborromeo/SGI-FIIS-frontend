import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ConfirmProvider } from '../context/ConfirmContext';
import { vi } from 'vitest';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    authValue = {
      user: {
        id: 1,
        roleCode: 'ADMIN',
        firstNames: 'Admin',
        lastNames: 'User',
        email: 'admin@sgi.com',
      },
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
    },
  } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue as any}>
        <ToastProvider>
          <ConfirmProvider>
            <MemoryRouter initialEntries={[route]}>
              {ui}
            </MemoryRouter>
          </ConfirmProvider>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
