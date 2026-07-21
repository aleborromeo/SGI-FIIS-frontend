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
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroups: vi.fn().mockResolvedValue([
      { id: 1, groupCode: 'GI-01', groupName: 'Grupo IA', active: true },
    ]),
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

    fireEvent.change(screen.getByLabelText(/DNI/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Nombres/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'juan@unas.edu.pe' } });

    // Group options load asynchronously; wait for them before selecting.
    await screen.findByText(/Grupo IA/);
    fireEvent.change(screen.getByLabelText(/Grupo de Investigación/i), { target: { value: '1' } });

    const submit = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
    const payload = mockCreateUser.mock.calls[0][0];
    expect(payload.dni).toBe('12345678');
    expect(payload.firstNames).toBe('Juan');
    expect(payload.roleCode).toBe('ESTUDIANTE');
  });

  it('shows a validation error for a short DNI', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/DNI/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Nombres/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Perez' } });

    await screen.findByText(/Grupo IA/);
    fireEvent.change(screen.getByLabelText(/Grupo de Investigación/i), { target: { value: '1' } });

    const submit = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    expect(await screen.findByText(/DNI debe tener exactamente 8/i)).toBeDefined();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});
