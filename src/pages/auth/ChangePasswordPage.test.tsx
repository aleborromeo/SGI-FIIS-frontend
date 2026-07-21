import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ChangePasswordPage } from './ChangePasswordPage';
import { api } from '../../services/api';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChangePasswordPage', () => {
  let mockLogoutFn = vi.fn();
  let mockCompleteRegistrationFn = vi.fn();
  let defaultAuthValue: any;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    localStorage.clear();

    mockLogoutFn = vi.fn();
    mockCompleteRegistrationFn = vi.fn();

    defaultAuthValue = {
      user: { email: 'test@unas.edu.pe', firstNames: 'Test', lastNames: 'User', roleCode: 'ASESOR' },
      roles: [],
      currentRole: null,
      loading: false,
      error: null,
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogoutFn,
      switchRole: vi.fn(),
      clearError: vi.fn(),
      completeRegistration: mockCompleteRegistrationFn,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects to /login if no stored user in localStorage', async () => {
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard if stored user mustChangePassword is false', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: false }));
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('renders password change elements when user needs password change', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: true }));
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    expect(screen.getByText('Cambio de Contraseña Obligatorio')).toBeDefined();
    expect(screen.getByLabelText('Contraseña actual')).toBeDefined();
    expect(screen.getByLabelText('Nueva contraseña')).toBeDefined();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeDefined();
  });

  it('validates fields constraints when changing password', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: true }));
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    const currentInput = screen.getByLabelText('Contraseña actual');
    const newInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar nueva contraseña');
    const form = currentInput.closest('form')!;

    // Missing fields
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('Todos los campos son obligatorios.')).toBeDefined();

    // Password length
    await act(async () => {
      fireEvent.change(currentInput, { target: { value: 'OldPass1!' } });
      fireEvent.change(newInput, { target: { value: 'New1!' } });
      fireEvent.change(confirmInput, { target: { value: 'New1!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La contraseña debe tener entre 6 y 12 caracteres.')).toBeDefined();

    // Password uppercase
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'newpass1!' } });
      fireEvent.change(confirmInput, { target: { value: 'newpass1!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La contraseña debe contener al menos una letra mayúscula.')).toBeDefined();

    // Password lowercase
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'NEWPASS1!' } });
      fireEvent.change(confirmInput, { target: { value: 'NEWPASS1!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La contraseña debe contener al menos una letra minúscula.')).toBeDefined();

    // Password number
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'NewPass!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPass!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La contraseña debe contener al menos un número.')).toBeDefined();

    // Password symbol
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'NewPass123' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPass123' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La contraseña debe contener al menos un símbolo (ej. !, @, #, $, %, etc.).')).toBeDefined();

    // Password mismatch
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'NewPass1!' } });
      fireEvent.change(confirmInput, { target: { value: 'Diff1!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('Las contraseñas no coinciden')).toBeDefined();

    // Same password as current
    await act(async () => {
      fireEvent.change(newInput, { target: { value: 'OldPass1!' } });
      fireEvent.change(confirmInput, { target: { value: 'OldPass1!' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('La nueva contraseña no puede ser igual a la contraseña actual.')).toBeDefined();
  });

  it('submits password change successfully, updates context, and navigates to dashboard', async () => {
    localStorage.setItem('sgi_token', 'fake-token');
    localStorage.setItem('sgi_user', JSON.stringify({
      email: 'test@unas.edu.pe',
      firstNames: 'Test',
      lastNames: 'User',
      roleCode: 'ASESOR',
      mustChangePassword: true,
    }));
    mockApi.post.mockResolvedValue({ message: 'Password updated successfully' });

    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    const currentInput = screen.getByLabelText('Contraseña actual');
    const newInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar nueva contraseña');
    const form = currentInput.closest('form')!;

    await act(async () => {
      fireEvent.change(currentInput, { target: { value: 'OldPass1!' } });
      fireEvent.change(newInput, { target: { value: 'NewPass1!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPass1!' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
    });
    expect(screen.getByText('Contraseña actualizada con éxito. Redirigiendo...')).toBeDefined();

    // Check localStorage updates
    const storedUser = JSON.parse(localStorage.getItem('sgi_user')!);
    expect(storedUser.mustChangePassword).toBe(false);
    expect(mockCompleteRegistrationFn).toHaveBeenCalledWith({
      token: 'fake-token',
      type: 'Bearer',
      email: 'test@unas.edu.pe',
      firstNames: 'Test',
      lastNames: 'User',
      roleCode: 'ASESOR',
      mustChangePassword: false,
      requiresVerification: false,
    });

    // Advance redirect timers
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles password change backend errors', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: true }));
    mockApi.post.mockRejectedValue(new Error('Incorrect current password'));

    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    const currentInput = screen.getByLabelText('Contraseña actual');
    const newInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar nueva contraseña');
    const form = currentInput.closest('form')!;

    await act(async () => {
      fireEvent.change(currentInput, { target: { value: 'WrongOld1!' } });
      fireEvent.change(newInput, { target: { value: 'NewPass1!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPass1!' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByText('Incorrect current password')).toBeDefined();
  });

  it('logs out and redirects to /login on cancel click', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: true }));
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await act(async () => {
      cancelBtn.click();
    });

    expect(mockLogoutFn).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggles password visibility for all three inputs', async () => {
    localStorage.setItem('sgi_user', JSON.stringify({ email: 'test@unas.edu.pe', mustChangePassword: true }));
    renderWithProviders(<ChangePasswordPage />, { authValue: defaultAuthValue });

    const currentInput = screen.getByLabelText('Contraseña actual');
    const newInput = screen.getByLabelText('Nueva contraseña');
    const confirmInput = screen.getByLabelText('Confirmar nueva contraseña');

    expect(currentInput.getAttribute('type')).toBe('password');
    expect(newInput.getAttribute('type')).toBe('password');
    expect(confirmInput.getAttribute('type')).toBe('password');

    const toggleBtns = screen.getAllByRole('button');
    // Button indices inside form: 0: toggle current, 1: toggle new, 2: toggle confirm
    await act(async () => {
      toggleBtns[0].click(); // toggle current
    });
    expect(currentInput.getAttribute('type')).toBe('text');

    await act(async () => {
      toggleBtns[1].click(); // toggle new
    });
    expect(newInput.getAttribute('type')).toBe('text');

    await act(async () => {
      toggleBtns[2].click(); // toggle confirm
    });
    expect(confirmInput.getAttribute('type')).toBe('text');
  });
});

