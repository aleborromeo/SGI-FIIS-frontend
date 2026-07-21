import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { UserManagement } from './UserManagement';
import { userService } from '../../services/userService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/userService', () => ({
  userService: {
    create: vi.fn(),
    getAll: vi.fn(),
    resetPassword: vi.fn(),
    toggleStatus: vi.fn(),
    update: vi.fn(),
  },
}));

const mockUserService = vi.mocked(userService);

describe('UserManagement page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockUserService.getAll.mockResolvedValue([
      {
        id: 20,
        dni: '99999999',
        firstNames: 'Alice',
        lastNames: 'Smith',
        institutionalEmail: 'alice@sgi.com',
        phone: '999111222',
        roleCode: 'DOCENTE_INVESTIGADOR',
        active: true,
      },
    ] as any);

    mockUserService.update.mockResolvedValue({} as any);
    mockUserService.create.mockResolvedValue({
      id: 21,
      institutionalEmail: 'newadmin@sgi.com',
      temporaryPassword: 'adminPassword123',
    } as any);
  });

  it('renders table headers and row items on load', async () => {
    renderWithProviders(<UserManagement />);

    expect(mockUserService.getAll).toHaveBeenCalled();
    
    // Wait for row render
    expect(await screen.findByText(/Alice Smith/i)).toBeDefined();
    expect(screen.getByText(/alice@sgi.com/i)).toBeDefined();
  });

  it('allows clicking Edit User to open modal and submit changes', async () => {
    renderWithProviders(<UserManagement />);

    // Locate "Editar" button
    const editBtn = await screen.findByRole('button', { name: /Editar/i });
    expect(editBtn).toBeDefined();

    await act(async () => {
      editBtn.click();
    });

    // Check modal form is open
    expect(screen.getByText('Editar Usuario')).toBeDefined();
    
    // Input modifications
    const nameInput = screen.getByDisplayValue('Alice');
    fireEvent.change(nameInput, { target: { value: 'Alice Modified' } });

    // The submit button inside the edit modal is labeled "Actualizar"
    // So we must target the primary button.
    const saveBtn = screen.getAllByRole('button', { name: 'Actualizar' }).find(b => b.classList.contains('btn-primary'));
    expect(saveBtn).toBeDefined();

    await act(async () => {
      saveBtn?.click();
    });

    expect(mockUserService.update).toHaveBeenCalledWith(20, expect.objectContaining({
      firstNames: 'Alice Modified',
    }));
  });

  it('allows clicking Create User button to open creation modal and submit', async () => {
    renderWithProviders(<UserManagement />);

    // Click "Nuevo Usuario" button
    const createBtn = screen.getByRole('button', { name: 'Nuevo Usuario' });
    expect(createBtn).toBeDefined();

    await act(async () => {
      createBtn.click();
    });

    // Modal should open
    expect(screen.getByText('Crear Usuario')).toBeDefined();

    // Fill inputs
    fireEvent.change(screen.getByPlaceholderText('8 caracteres'), { target: { value: '11223344' } });
    fireEvent.change(screen.getByPlaceholderText('Nombres completos'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos completos'), { target: { value: 'Builder' } });
    fireEvent.change(screen.getByPlaceholderText('Si se deja vacio, se autogenera: apellido.nombre@unas.edu.pe'), { target: { value: 'bob@sgi.com' } });

    // Click submit
    const submitBtn = screen.getAllByRole('button', { name: 'Crear Usuario' }).find(b => b.classList.contains('btn-primary'));
    expect(submitBtn).toBeDefined();
    await act(async () => {
      submitBtn?.click();
    });

    expect(mockUserService.create).toHaveBeenCalled();
  });
});
