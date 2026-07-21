import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../../utils/testUtils';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let mockLoginFn = vi.fn();
  let mockClearErrorFn = vi.fn();
  let unauthAuthValue: any;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    mockLoginFn = vi.fn();
    mockClearErrorFn = vi.fn();

    unauthAuthValue = {
      user: null,
      roles: [],
      currentRole: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      login: mockLoginFn,
      logout: vi.fn(),
      switchRole: vi.fn(),
      clearError: mockClearErrorFn,
      completeRegistration: vi.fn(),
    };

    // Mock canvas context functions to prevent errors
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders login layout and inputs', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });

    // Flush captcha generate setTimeouts
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByLabelText('Correo institucional')).toBeDefined();
    expect(screen.getByLabelText('Contraseña')).toBeDefined();
    expect(screen.getByLabelText('Código de verificación')).toBeDefined();
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput.getAttribute('type')).toBe('password');

    // Click toggle button
    const toggleBtn = screen.getAllByRole('button')[1]; // toggle button
    await act(async () => {
      toggleBtn.click();
    });
    expect(passwordInput.getAttribute('type')).toBe('text');

    await act(async () => {
      toggleBtn.click();
    });
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const submitBtn = screen.getByRole('button', { name: 'Ingresar' });
    
    // Submit empty form
    await act(async () => {
      submitBtn.click();
    });
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('El correo institucional es obligatorio.')).toBeDefined();
  });

  it('validates captcha code match', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const emailInput = screen.getByLabelText('Correo institucional');
    const passwordInput = screen.getByLabelText('Contraseña');
    const captchaInput = screen.getByLabelText('Código de verificación');
    const submitBtn = screen.getByRole('button', { name: 'Ingresar' });

    // Fill in valid email/password but incorrect captcha
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(captchaInput, { target: { value: 'WRONGCODE' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText('Código de verificación incorrecto')).toBeDefined();
  });

  it('submits form successfully and handles mustChangePassword redirects', async () => {
    mockLoginFn.mockResolvedValue({ mustChangePassword: true });

    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const emailInput = screen.getByLabelText('Correo institucional');
    const passwordInput = screen.getByLabelText('Contraseña');
    const captchaInput = screen.getByLabelText('Código de verificación');
    const policiesCheckbox = screen.getByRole('checkbox');
    const submitBtn = screen.getByRole('button', { name: 'Ingresar' });

    // Get generated captcha code from global / window
    const code = (window as any).captchaCode;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(captchaInput, { target: { value: code } });
      fireEvent.click(policiesCheckbox);
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(mockLoginFn).toHaveBeenCalledWith('test@unas.edu.pe', 'Password123!');
    expect(mockNavigate).toHaveBeenCalledWith('/change-password');
  });

  it('submits form successfully and navigates to dashboard', async () => {
    mockLoginFn.mockResolvedValue({ mustChangePassword: false });

    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const emailInput = screen.getByLabelText('Correo institucional');
    const passwordInput = screen.getByLabelText('Contraseña');
    const captchaInput = screen.getByLabelText('Código de verificación');
    const policiesCheckbox = screen.getByRole('checkbox');
    const submitBtn = screen.getByRole('button', { name: 'Ingresar' });

    const code = (window as any).captchaCode;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(captchaInput, { target: { value: code } });
      fireEvent.click(policiesCheckbox);
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles credentials error messages', async () => {
    mockLoginFn.mockRejectedValue(new Error('unauthorized'));

    renderWithProviders(<LoginPage />, { authValue: { ...unauthAuthValue, error: 'unauthorized' } });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Error from auth value should show friendly error
    expect(screen.getByText('Usuario o contraseña incorrecto')).toBeDefined();
  });

  it('handles inactive user error message', async () => {
    renderWithProviders(<LoginPage />, { authValue: { ...unauthAuthValue, error: 'user is inactive' } });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('El usuario no está activo')).toBeDefined();
  });

  it('navigates home when clicking back button', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const backBtn = screen.getAllByRole('button')[0]; // back button is first button
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to forgot password', async () => {
    renderWithProviders(<LoginPage />, { authValue: unauthAuthValue });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const forgotBtn = screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' });
    await act(async () => {
      forgotBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('redirects to dashboard if already authenticated', async () => {
    renderWithProviders(<LoginPage />, { authValue: { ...unauthAuthValue, isAuthenticated: true } });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

