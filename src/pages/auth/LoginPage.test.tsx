import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoginPage from './LoginPage';

const makeAuth = (overrides = {}) =>
  ({
    login: vi.fn(),
    isAuthenticated: false,
    error: null,
    clearError: vi.fn(),
    ...overrides,
  } as any);

function renderPage(auth = makeAuth()) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renderiza el formulario con correo y boton ingresar', () => {
    renderPage();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('muestra alerta de validacion con campos vacios', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('llama a login con credenciales validas (captcha controlado)', async () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const login = vi.fn().mockResolvedValue({});
    renderPage(makeAuth({ login }));
    await userEvent.type(screen.getByLabelText(/correo/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Pass123!');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.type(screen.getByLabelText(/verificación/i), '222222');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/ingresar/i)).toBeInTheDocument();
    expect(login).toHaveBeenCalled();
    spy.mockRestore();
  });
});
