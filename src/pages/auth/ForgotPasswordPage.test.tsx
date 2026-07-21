import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockAuthService = vi.mocked(authService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Step 1 elements initially', async () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(screen.getByText('Restablecer contraseña')).toBeDefined();
    expect(screen.getByLabelText('Correo institucional')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Enviar Código' })).toBeDefined();
  });

  it('handles email validation constraints in Step 1', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    // Empty email
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('El correo institucional es obligatorio.')).toBeDefined();

    // Invalid format
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('Por favor, ingrese un correo válido.')).toBeDefined();

    // Invalid domain
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText('El correo debe pertenecer al dominio institucional (.edu.pe).')).toBeDefined();
  });

  it('submits email in Step 1 successfully and transitions to Step 2', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@unas.edu.pe');
    expect(screen.getByText('Code sent!')).toBeDefined();

    // Transition step after timeout
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Step 2 elements should render now
    expect(screen.getByLabelText('Código de verificación')).toBeDefined();
    expect(screen.getByLabelText('Nueva contraseña')).toBeDefined();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeDefined();
  });

  it('handles email submission backend errors in Step 1', async () => {
    mockAuthService.forgotPassword.mockRejectedValue(new Error('Email does not exist'));
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByText('Email does not exist')).toBeDefined();
  });

  it('validates form fields in Step 2', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
      fireEvent.submit(form);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // We are on Step 2. Get inputs
    const codeInput = screen.getByLabelText('Código de verificación');
    const newPassInput = screen.getByLabelText('Nueva contraseña');
    const confirmPassInput = screen.getByLabelText('Confirmar nueva contraseña');
    const step2Form = codeInput.closest('form')!;

    // Missing fields
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('Todos los campos son obligatorios.')).toBeDefined();

    // Code length
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: '123' } });
      fireEvent.change(newPassInput, { target: { value: 'Pass1!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Pass1!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('El código de verificación debe tener 6 dígitos.')).toBeDefined();

    // Password length
    await act(async () => {
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(newPassInput, { target: { value: 'P1!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'P1!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La contraseña debe tener entre 6 y 12 caracteres.')).toBeDefined();

    // Password uppercase
    await act(async () => {
      fireEvent.change(newPassInput, { target: { value: 'pass123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'pass123!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La contraseña debe contener al menos una letra mayúscula.')).toBeDefined();

    // Password lowercase
    await act(async () => {
      fireEvent.change(newPassInput, { target: { value: 'PASS123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'PASS123!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La contraseña debe contener al menos una letra minúscula.')).toBeDefined();

    // Password number
    await act(async () => {
      fireEvent.change(newPassInput, { target: { value: 'Password!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Password!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La contraseña debe contener al menos un número.')).toBeDefined();

    // Password symbol
    await act(async () => {
      fireEvent.change(newPassInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Password123' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La contraseña debe contener al menos un símbolo (ej. !, @, #, $, %, etc.).')).toBeDefined();

    // Password mismatch
    await act(async () => {
      fireEvent.change(newPassInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Different!' } });
    });
    await act(async () => {
      fireEvent.submit(step2Form);
    });
    expect(screen.getByText('La nueva contraseña y la confirmación no coinciden.')).toBeDefined();
  });

  it('submits successfully in Step 2 and redirects to login', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    mockAuthService.resetPassword.mockResolvedValue({ message: 'Password updated!' });
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    const codeInput = screen.getByLabelText('Código de verificación');
    const newPassInput = screen.getByLabelText('Nueva contraseña');
    const confirmPassInput = screen.getByLabelText('Confirmar nueva contraseña');
    const step2Form = codeInput.closest('form')!;

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(newPassInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Password123!' } });
    });

    await act(async () => {
      fireEvent.submit(step2Form);
    });

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith({
      email: 'test@unas.edu.pe',
      code: '123456',
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });
    expect(screen.getByText('Password updated!')).toBeDefined();

    // Wait for redirect timeout
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles backend error in Step 2', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    mockAuthService.resetPassword.mockRejectedValue(new Error('Invalid code'));
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    const codeInput = screen.getByLabelText('Código de verificación');
    const newPassInput = screen.getByLabelText('Nueva contraseña');
    const confirmPassInput = screen.getByLabelText('Confirmar nueva contraseña');
    const step2Form = codeInput.closest('form')!;

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.change(newPassInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPassInput, { target: { value: 'Password123!' } });
    });

    await act(async () => {
      fireEvent.submit(step2Form);
    });

    expect(screen.getByText('Invalid code')).toBeDefined();
  });

  it('handles back button navigation logic in Step 1 and Step 2', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    renderWithProviders(<ForgotPasswordPage />);

    const backBtn = screen.getAllByRole('button')[0]; // back button is first button

    // Click back in Step 1 -> navigate to login
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Go to Step 2
    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Click back in Step 2 -> return to Step 1
    const backBtnStep2 = screen.getAllByRole('button')[0];
    await act(async () => {
      backBtnStep2.click();
    });

    expect(screen.getByLabelText('Correo institucional')).toBeDefined();
  });

  it('toggles password visibility in Step 2', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'Code sent!' });
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText('Correo institucional');
    const form = emailInput.closest('form')!;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@unas.edu.pe' } });
    });
    await act(async () => {
      fireEvent.submit(form);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // We are on Step 2
    const newPassInput = screen.getByLabelText('Nueva contraseña');
    const confirmPassInput = screen.getByLabelText('Confirmar nueva contraseña');

    // Default password type
    expect(newPassInput.getAttribute('type')).toBe('password');
    expect(confirmPassInput.getAttribute('type')).toBe('password');

    // Click first password toggle (newPassword)
    const toggleBtns = screen.getAllByRole('button');
    // Button indices: 0: back, 1: toggle newPass, 2: toggle confirmPass
    await act(async () => {
      toggleBtns[1].click();
    });
    expect(newPassInput.getAttribute('type')).toBe('text');

    // Click second password toggle (confirmPassword)
    await act(async () => {
      toggleBtns[2].click();
    });
    expect(confirmPassInput.getAttribute('type')).toBe('text');
  });
});

