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

const mockUsers = [
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
  {
    id: 21,
    dni: '88888888',
    firstNames: 'Bob',
    lastNames: 'Jones',
    institutionalEmail: 'bob@sgi.com',
    phone: '888222333',
    roleCode: 'ESTUDIANTE',
    active: false,
  },
];

describe('UserManagement page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockUserService.getAll.mockResolvedValue(mockUsers as any);
    mockUserService.update.mockResolvedValue({} as any);
    mockUserService.create.mockResolvedValue({
      id: 22,
      institutionalEmail: 'newadmin@sgi.com',
      temporaryPassword: 'adminPassword123',
    } as any);
    mockUserService.toggleStatus.mockResolvedValue({} as any);
  });

  it('renders users after loading', async () => {
    renderWithProviders(<UserManagement />);

    expect(mockUserService.getAll).toHaveBeenCalled();
    expect(await screen.findByText(/Alice Smith/i)).toBeDefined();
    expect(screen.getByText(/alice@sgi.com/i)).toBeDefined();
    expect(screen.getByText(/Bob Jones/i)).toBeDefined();
  });

  it('shows empty state when no users returned', async () => {
    mockUserService.getAll.mockResolvedValue([]);
    renderWithProviders(<UserManagement />);

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(await screen.findByText(/No se encontraron usuarios/i)).toBeDefined();
  });

  it('filters users by search query', async () => {
    renderWithProviders(<UserManagement />);

    await screen.findByText(/Alice Smith/i);

    const searchInput = screen.getByPlaceholderText(/DNI, nombre, correo o rol/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(mockUserService.getAll).toHaveBeenCalledWith('Alice');
  });

  it('filters users by role', async () => {
    renderWithProviders(<UserManagement />);
    await screen.findByText(/Alice Smith/i);

    const searchInput = screen.getByPlaceholderText(/DNI, nombre, correo o rol/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'DOCENTE' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(mockUserService.getAll).toHaveBeenCalledWith('DOCENTE');
  });

  it('activates a user', async () => {
    mockUserService.getAll.mockResolvedValue([
      { ...mockUsers[1], active: false },
    ] as any);

    renderWithProviders(<UserManagement />);
    await screen.findByText(/Bob Jones/i);

    const activateBtn = screen.getByRole('button', { name: /Activar/i });
    await act(async () => {
      fireEvent.click(activateBtn);
    });

    const confirmBtns = await screen.findAllByRole('button', { name: /Activar/i });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    await act(async () => {
      fireEvent.click(modalConfirmBtn);
    });

    expect(mockUserService.toggleStatus).toHaveBeenCalledWith(21, true);
  });

  it('deactivates a user', async () => {
    renderWithProviders(<UserManagement />);
    await screen.findByText(/Alice Smith/i);

    const deactivateBtn = screen.getByRole('button', { name: /Desactivar/i });
    await act(async () => {
      fireEvent.click(deactivateBtn);
    });

    const confirmBtns = await screen.findAllByRole('button', { name: /Desactivar/i });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    await act(async () => {
      fireEvent.click(modalConfirmBtn);
    });

    expect(mockUserService.toggleStatus).toHaveBeenCalledWith(20, false);
  });

  it('opens create user modal and submits', async () => {
    renderWithProviders(<UserManagement />);

    const createBtn = screen.getByRole('button', { name: /Nuevo Usuario/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    expect(screen.getByText('Crear Usuario')).toBeDefined();

    fireEvent.change(screen.getByPlaceholderText('8 caracteres'), { target: { value: '11223344' } });
    fireEvent.change(screen.getByPlaceholderText('Nombres completos'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText('Apellidos completos'), { target: { value: 'Builder' } });

    const submitBtn = screen.getByRole('button', { name: /Crear Usuario/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockUserService.create).toHaveBeenCalled();
  });

  it('renders pagination when there are many users', async () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: 100 + i,
      dni: `${10000000 + i}`,
      firstNames: `User${i}`,
      lastNames: `Test${i}`,
      institutionalEmail: `user${i}@sgi.com`,
      roleCode: 'ESTUDIANTE',
      active: true,
    }));

    mockUserService.getAll.mockResolvedValue(manyUsers as any);
    renderWithProviders(<UserManagement />);

    await screen.findByText(/User0 Test0/i);

    expect(screen.queryByText(/User12 Test12/i)).toBeNull();
  });

  it('shows loading state while fetching users', async () => {
    mockUserService.getAll.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UserManagement />);

    expect(screen.getByText(/Cargando/i)).toBeDefined();
  });
});
