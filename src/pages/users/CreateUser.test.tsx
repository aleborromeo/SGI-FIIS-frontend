import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { CreateUser } from './CreateUser';
import { userService } from '../../services/userService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/userService', () => ({
  userService: {
    createUser: vi.fn(),
    getAll: vi.fn(),
    resetPassword: vi.fn(),
    toggleStatus: vi.fn(),
    updateUser: vi.fn(),
  },
}));

const mockUserService = vi.mocked(userService);

describe('CreateUser page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockUserService.getAll.mockResolvedValue([
      {
        id: 10,
        dni: '12345678',
        firstNames: 'Juan',
        lastNames: 'Perez',
        institutionalEmail: 'juan@unas.edu.pe',
        phone: '999999999',
        roleCode: 'ESTUDIANTE',
        active: true,
      },
    ] as any);

    mockUserService.createUser.mockResolvedValue({
      id: 11,
      institutionalEmail: 'newuser@unas.edu.pe',
      temporaryPassword: 'tempPassword123',
    } as any);
  });

  it('renders form fields on the create tab', () => {
    renderWithProviders(<CreateUser />);

    expect(screen.getByPlaceholderText('8 caracteres')).toBeDefined();
    expect(screen.getByPlaceholderText('Nombres completos')).toBeDefined();
    expect(screen.getByPlaceholderText('Apellidos completos')).toBeDefined();
    expect(screen.getByPlaceholderText('ejemplo@unas.edu.pe')).toBeDefined();
    expect(screen.getByPlaceholderText('Ej. +51 987654321')).toBeDefined();
    expect(screen.getByText('Registrar Usuario')).toBeDefined();
  });

  it('allows filling out all form inputs', () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const phoneInput = screen.getByPlaceholderText('Ej. +51 987654321');

    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });
    fireEvent.change(phoneInput, { target: { value: '987654321' } });

    expect((dniInput as HTMLInputElement).value).toBe('87654321');
    expect((firstNamesInput as HTMLInputElement).value).toBe('Juan');
    expect((lastNamesInput as HTMLInputElement).value).toBe('Perez');
    expect((phoneInput as HTMLInputElement).value).toBe('987654321');
  });

  it('allows selecting a role from the dropdown', () => {
    renderWithProviders(<CreateUser />);

    const roleSelect = screen.getAllByRole('combobox')[0];
    expect((roleSelect as HTMLSelectElement).value).toBe('ESTUDIANTE');

    fireEvent.change(roleSelect, { target: { value: 'DOCENTE_INVESTIGADOR' } });
    expect((roleSelect as HTMLSelectElement).value).toBe('DOCENTE_INVESTIGADOR');
  });

  it('shows validation error when submitting with empty required fields', async () => {
    renderWithProviders(<CreateUser />);

    const submitBtn = screen.getByText('Registrar Usuario');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });

  it('shows validation error when email does not end with .edu.pe', async () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const emailInput = screen.getByPlaceholderText('ejemplo@unas.edu.pe');

    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });
    fireEvent.change(emailInput, { target: { value: 'juan@gmail.com' } });

    const submitBtn = screen.getByText('Registrar Usuario');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });

  it('shows validation error when DNI is not 8 digits', async () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');

    fireEvent.change(dniInput, { target: { value: '12345' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });

    const submitBtn = screen.getByText('Registrar Usuario');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockUserService.createUser).not.toHaveBeenCalled();
  });

  it('submits the form successfully with valid data', async () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const phoneInput = screen.getByPlaceholderText('Ej. +51 987654321');
    const submitBtn = screen.getByText('Registrar Usuario');

    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });
    fireEvent.change(phoneInput, { target: { value: '987654321' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      dni: '87654321',
      firstNames: 'Juan',
      lastNames: 'Perez',
      institutionalEmail: 'juan.perez@unas.edu.pe',
      phone: '987654321',
      roleCode: 'ESTUDIANTE',
    });

    expect(screen.getByText('Credenciales Temporales de Acceso')).toBeDefined();
    expect(screen.getByText('tempPassword123')).toBeDefined();
  });

  it('displays error message when createUser fails', async () => {
    mockUserService.createUser.mockRejectedValue(new Error('El DNI ya está registrado'));

    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const submitBtn = screen.getByText('Registrar Usuario');

    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('El DNI ya está registrado')).toBeDefined();
  });

  it('navigates back to create form after successful registration', async () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const submitBtn = screen.getByText('Registrar Usuario');

    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('Credenciales Temporales de Acceso')).toBeDefined();

    const registerAnotherBtn = screen.getByText('Registrar otro usuario');
    await act(async () => {
      fireEvent.click(registerAnotherBtn);
    });

    expect(screen.getByPlaceholderText('8 caracteres')).toBeDefined();
  });
});
