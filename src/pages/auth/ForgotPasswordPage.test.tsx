import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ForgotPasswordPage } from './ForgotPasswordPage';

vi.mock('../../services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockAuth = vi.mocked(authService);

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renderiza el paso 1 con el campo correo', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('muestra error de validacion con dominio incorrecto', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/correo/i), 'usuario@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(await screen.findByText(/edu\.pe/i)).toBeInTheDocument();
  });

  it('llama a forgotPassword con un correo valido', async () => {
    mockAuth.forgotPassword.mockResolvedValue({ message: 'Código enviado' });
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/correo/i), 'a@unas.edu.pe');
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(mockAuth.forgotPassword).toHaveBeenCalledWith('a@unas.edu.pe');
  });
});
