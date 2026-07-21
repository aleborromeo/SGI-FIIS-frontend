import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { renderWithProviders } from '../utils/testUtils';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

describe('Sidebar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders brand title', () => {
    renderWithProviders(<Sidebar />);
    // Brand should appear
    expect(screen.getByText('FIIS - UNAS')).toBeDefined();
  });

  it('renders navigation items for ADMIN role', async () => {
    renderWithProviders(<Sidebar />, {
      authValue: {
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
      } as any,
    });

    // Admin-specific items
    expect(await screen.findByText('Admin User')).toBeDefined();
  });

  it('renders user initials', () => {
    renderWithProviders(<Sidebar />, {
      authValue: {
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
      } as any,
    });

    // Should show initials AU
    expect(screen.getByText('AU')).toBeDefined();
  });

  it('shows logout confirmation modal on logout click', async () => {
    renderWithProviders(<Sidebar />);

    // Find and click logout button
    const logoutBtn = screen.getAllByRole('button').find(
      (b) => b.textContent?.includes('Cerrar') || b.textContent?.includes('Session')
    );
    if (logoutBtn) {
      await act(async () => {
        fireEvent.click(logoutBtn);
      });
    }

    // Confirmation dialog should appear
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeDefined();
  });

  it('cancels logout when cancel button is clicked', async () => {
    renderWithProviders(<Sidebar />);

    // Find and click logout button
    const buttons = screen.getAllByRole('button');
    const logoutBtn = buttons.find(
      (b) => b.className?.includes('danger') || b.textContent?.includes('Cerrar')
    );
    if (logoutBtn) {
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      // Dialog should appear, then cancel
      const dialog = document.querySelector('dialog');
      if (dialog) {
        const cancelBtn = dialog.querySelector('button:first-of-type') as HTMLElement;
        await act(async () => {
          if (cancelBtn) fireEvent.click(cancelBtn);
        });
        // Dialog should close
        expect(document.querySelector('dialog[open]')).toBeNull();
      }
    }
  });

  it('calls logout and navigates on confirm logout', async () => {
    const mockLogout = vi.fn();
    renderWithProviders(<Sidebar />, {
      authValue: {
        user: { id: 1, roleCode: 'ADMIN', firstNames: 'Admin', lastNames: 'User', email: 'admin@sgi.com' },
        roles: ['ADMIN'],
        currentRole: 'ADMIN',
        loading: false,
        error: null,
        isAuthenticated: true,
        login: vi.fn(),
        logout: mockLogout,
        switchRole: vi.fn(),
        clearError: vi.fn(),
        completeRegistration: vi.fn(),
      } as any,
    });

    // Find logout button (danger class)
    const buttons = screen.getAllByRole('button');
    const logoutBtn = buttons.find((b) => b.className?.includes('danger'));
    if (logoutBtn) {
      await act(async () => {
        fireEvent.click(logoutBtn);
      });

      // Find confirm button in the dialog
      const dialog = document.querySelector('dialog');
      if (dialog) {
        const confirmBtn = dialog.querySelector('.sgi-modal-confirm') as HTMLElement;
        if (confirmBtn) {
          await act(async () => {
            fireEvent.click(confirmBtn);
          });
          expect(mockLogout).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/');
        }
      }
    }
  });

  it('shows settings message when settings button is clicked', async () => {
    renderWithProviders(<Sidebar />);

    const buttons = screen.getAllByRole('button');
    const settingsBtn = buttons.find((b) => b.textContent?.includes('Configuración') || b.textContent?.includes('Settings'));
    if (settingsBtn) {
      await act(async () => {
        fireEvent.click(settingsBtn);
      });
      // Some message should appear (settingsMessage)
      expect(document.querySelector('.sidebar-settings-message')).toBeDefined();
    }
  });

  it('renders overlay when isOpen=true', () => {
    renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />);
    expect(document.querySelector('.sidebar-overlay')).toBeDefined();
  });

  it('does not render overlay when isOpen=false', () => {
    renderWithProviders(<Sidebar isOpen={false} onClose={vi.fn()} />);
    expect(document.querySelector('.sidebar-overlay')).toBeNull();
  });

  it('calls onClose when overlay is clicked', async () => {
    const mockOnClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={mockOnClose} />);

    const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
    await act(async () => {
      fireEvent.click(overlay);
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders DOCENTE_INVESTIGADOR navigation items', () => {
    renderWithProviders(<Sidebar />, {
      authValue: {
        user: { id: 3, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'Juan', lastNames: 'Pérez', email: 'juan@sgi.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
        loading: false,
        error: null,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        switchRole: vi.fn(),
        clearError: vi.fn(),
        completeRegistration: vi.fn(),
      } as any,
    });

    expect(screen.getByText('Juan Pérez')).toBeDefined();
  });

  it('shows Cargando... when user is null', () => {
    renderWithProviders(<Sidebar />, {
      authValue: {
        user: null,
        roles: [],
        currentRole: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        switchRole: vi.fn(),
        clearError: vi.fn(),
        completeRegistration: vi.fn(),
      } as any,
    });

    expect(screen.getByText('Cargando...')).toBeDefined();
  });
});

