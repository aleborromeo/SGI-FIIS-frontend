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
    
    // Default mocked resolve values
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

  it('renders tabs and the default create user tab', async () => {
    renderWithProviders(<CreateUser />);

    expect(screen.getByText('Agregar')).toBeDefined();
    expect(screen.getByText('Ver Usuarios')).toBeDefined();

    expect(screen.getByPlaceholderText('8 caracteres')).toBeDefined();
    expect(screen.getByPlaceholderText('Nombres completos')).toBeDefined();
    expect(screen.getByPlaceholderText('Apellidos completos')).toBeDefined();
    expect(screen.getByPlaceholderText('ejemplo@unas.edu.pe')).toBeDefined();
  });

  it('allows filling out the form manually and submitting', async () => {
    renderWithProviders(<CreateUser />);

    const dniInput = screen.getByPlaceholderText('8 caracteres');
    const firstNamesInput = screen.getByPlaceholderText('Nombres completos');
    const lastNamesInput = screen.getByPlaceholderText('Apellidos completos');
    const phoneInput = screen.getByPlaceholderText('Ej. +51 987654321');
    const submitBtn = screen.getByText('Registrar Usuario');

    // Fill form manually
    fireEvent.change(dniInput, { target: { value: '87654321' } });
    fireEvent.change(firstNamesInput, { target: { value: 'Juan' } });
    fireEvent.change(lastNamesInput, { target: { value: 'Perez' } });
    fireEvent.change(phoneInput, { target: { value: '987654321' } });

    // Submit form
    await act(async () => {
      submitBtn.click();
    });

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      dni: '87654321',
      firstNames: 'Juan',
      lastNames: 'Perez',
      institutionalEmail: 'juan.perez@unas.edu.pe', // Auto-generated email
      phone: '987654321',
      roleCode: 'ESTUDIANTE',
    });
    
    // After creation, should show temporary password details
    expect(screen.getByText('Credenciales Temporales de Acceso')).toBeDefined();
    expect(screen.getByText('tempPassword123')).toBeDefined();
  });

  it('switches to list tab and renders user grid table and triggers search', async () => {
    renderWithProviders(<CreateUser />);

    const listTabBtn = screen.getByText('Ver Usuarios');
    await act(async () => {
      listTabBtn.click();
    });

    expect(mockUserService.getAll).toHaveBeenCalled();
    expect(screen.getByText('Juan Perez')).toBeDefined();
    expect(screen.getByText('juan@unas.edu.pe')).toBeDefined();

    // Trigger filter search
    const filterInput = screen.getByPlaceholderText('Buscar usuarios por nombre, correo, DNI, rol o estado...');
    expect(filterInput).toBeDefined();

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: 'Juan' } });
    });
  });

  it('triggers reset password on row action click', async () => {
    mockUserService.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    } as any);

    renderWithProviders(<CreateUser />);

    // Switch to list tab
    await act(async () => {
      screen.getByText('Ver Usuarios').click();
    });

    // Locate reset password key button
    const resetBtn = screen.getByTitle('Reset Pass');
    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn.click();
    });

    // Confirm dialog - reset password uses "Restablecer" confirm button
    const confirmModalBtn = await screen.findByRole('button', { name: /Restablecer/i });
    expect(confirmModalBtn).toBeDefined();

    await act(async () => {
      confirmModalBtn.click();
    });

    expect(mockUserService.resetPassword).toHaveBeenCalledWith(10);
    // Should display toast success message
    expect(await screen.findByText(/Contraseña restablecida/i)).toBeDefined();
  });

  it('toggles user active status on toggle switch click', async () => {
    mockUserService.toggleStatus.mockResolvedValue({} as any);

    renderWithProviders(<CreateUser />);

    await act(async () => {
      screen.getByText('Ver Usuarios').click();
    });

    // Look for deactivate button
    const toggleBtn = screen.getByTitle('Desactivar');
    expect(toggleBtn).toBeDefined();

    await act(async () => {
      toggleBtn.click();
    });

    const confirmModalBtn = screen.getAllByRole('button', { name: /Desactivar/i })[1];
    await act(async () => {
      confirmModalBtn.click();
    });

    expect(mockUserService.toggleStatus).toHaveBeenCalledWith(10, false);
  });
});
