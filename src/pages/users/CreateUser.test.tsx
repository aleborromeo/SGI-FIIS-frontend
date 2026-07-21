import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { AuthContext } from '../../context/AuthContext';
import { CreateUser } from './CreateUser';
import { userService } from '../../services/userService';
import { researchService } from '../../services/researchService';

const mockGetAll = vi.hoisted(() => vi.fn());
const mockCreateUser = vi.hoisted(() => vi.fn());

vi.mock('../../services/userService', () => ({
  userService: {
    getAll: mockGetAll,
    createUser: mockCreateUser,
    updateUser: vi.fn(),
    rejectUser: vi.fn(),
    activateUser: vi.fn(),
    resetPassword: vi.fn(),
    toggleStatus: vi.fn(),
  },
}));

const mockGetGroups = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroups: mockGetGroups,
    getGroupByUser: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}));

const authValue = {
  user: { id: 1, firstNames: 'Admin', lastNames: 'Istrador', email: 'a@unas.edu.pe' },
  currentRole: 'ADMIN',
  isAuthenticated: true,
  roles: ['ADMIN'],
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
};

const renderPage = () =>
  render(
    <AuthContext.Provider value={authValue as any}>
      <ToastProvider>
        <ConfirmProvider>
          <MemoryRouter>
            <CreateUser />
          </MemoryRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );

describe('CreateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue([]);
    mockGetGroups.mockResolvedValue([
      { id: 1, groupCode: 'GINSOFT', groupName: 'Grupo de Investigación en Software', active: true },
    ]);
  });

  it('renders the management title', async () => {
    renderPage();
    expect(await screen.findByText('Gestión de Usuarios')).toBeDefined();
  });

  it('creates a user via the form', async () => {
    mockCreateUser.mockResolvedValue({
      id: 9,
      firstNames: 'Juan',
      lastNames: 'Perez',
      institutionalEmail: 'juan@unas.edu.pe',
      temporaryPassword: 'temp123',
      roleDescription: 'Estudiante',
    });
    renderPage();

    await screen.findByLabelText(/DNI/i);

    fireEvent.change(screen.getByLabelText(/DNI/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Nombres/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'juan@unas.edu.pe' } });
    fireEvent.change(screen.getByLabelText(/Rol/i), { target: { value: 'ESTUDIANTE' } });

    // Select a research group (required for non-ADMIN roles)
    const groupSelect = screen.getByLabelText(/Grupo de Investigación/i);
    await waitFor(() => {
      expect(groupSelect.querySelector('option[value="1"]')).toBeTruthy();
    });
    fireEvent.change(groupSelect, { target: { value: '1' } });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
    const payload = mockCreateUser.mock.calls[0][0];
    expect(payload.dni).toBe('12345678');
    expect(payload.firstNames).toBe('Juan');
    expect(payload.roleCode).toBe('ESTUDIANTE');
  });

  it('shows a validation error for a short DNI', async () => {
    renderPage();
    await screen.findByLabelText(/DNI/i);

    fireEvent.change(screen.getByLabelText(/DNI/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Nombres/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Perez' } });

    fireEvent.submit(document.querySelector('form')!);

    expect(await screen.findByText(/DNI debe tener exactamente 8/i)).toBeDefined();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});
