import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AssignReviewers } from './AssignReviewers';
import { userService } from '../../services/userService';
import { evaluacionService } from '../../services/evaluacionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/userService', () => ({
  userService: {
    getAllUsers: vi.fn(),
    getByRole: vi.fn(),
    getReviewers: vi.fn(),
  },
}));

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    assignReviewer: vi.fn(),
    assignReviewers: vi.fn(),
    getByProject: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?projectId=1&projectTitle=Proyecto+IA', pathname: '/projects/assign' }),
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockUserService = vi.mocked(userService);
const mockEvaluacionService = vi.mocked(evaluacionService);

const mockUsers = [
  {
    id: 10,
    firstNames: 'Carlos',
    lastNames: 'Sánchez',
    institutionalEmail: 'carlos@sgi.com',
    roleCode: 'EVALUADOR',
    roleDescription: 'Evaluador',
    active: true,
  },
  {
    id: 11,
    firstNames: 'Ana',
    lastNames: 'Gómez',
    institutionalEmail: 'ana@sgi.com',
    roleCode: 'DOCENTE_INVESTIGADOR',
    roleDescription: 'Docente Investigador',
    active: true,
  },
  {
    id: 12,
    firstNames: 'Luis',
    lastNames: 'Torres',
    institutionalEmail: 'luis@sgi.com',
    roleCode: 'COORDINADOR_GRUPO',
    roleDescription: 'Coordinador de Grupo',
    active: true,
  },
];

describe('AssignReviewers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUserService.getReviewers.mockResolvedValue(mockUsers as any);
    mockUserService.getAllUsers.mockResolvedValue(mockUsers as any);
    mockUserService.getByRole.mockResolvedValue(mockUsers as any);
    mockEvaluacionService.assignReviewer.mockResolvedValue({} as any);
    mockEvaluacionService.assignReviewers.mockResolvedValue(undefined as any);
    mockEvaluacionService.getByProject.mockResolvedValue([]);
  });

  it('shows loading state while fetching reviewers', async () => {
    mockUserService.getReviewers.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<AssignReviewers />);
    expect(screen.getByText(/cargando docentes/i)).toBeDefined();
  });

  it('renders available reviewers after loading', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });
    expect(screen.getByText('Ana Gómez')).toBeDefined();
    expect(screen.getByText('Luis Torres')).toBeDefined();
  });

  it('renders page heading', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText(/evaluaciones/i)).toBeDefined();
    });
  });

  it('filters reviewers by search text', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Ana' } });
    });

    expect(screen.queryByText('Carlos Sánchez')).toBeNull();
    expect(screen.getByText('Ana Gómez')).toBeDefined();
  });

  it('renders assign buttons for reviewers', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });
    const assignBtns = screen.getAllByRole('button', { name: /asignar/i });
    expect(assignBtns.length).toBeGreaterThan(0);
  });

  it('adds reviewer to assigned list when clicking assign', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const assignBtns = screen.getAllByRole('button', { name: /asignar$/i });
    await act(async () => {
      fireEvent.click(assignBtns[0]);
    });

    expect(screen.getByText(/\d+\s*seleccionado/)).toBeDefined();
  });

  it('shows already assigned badge after assigning', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const assignBtns = screen.getAllByRole('button', { name: /asignar$/i });
    await act(async () => {
      fireEvent.click(assignBtns[0]);
    });

    const assignedBadges = screen.getAllByText('Asignado');
    expect(assignedBadges.length).toBeGreaterThan(0);
  });

  it('disables confirm button when no reviewers selected', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar asignación/i });
    expect(confirmBtn.hasAttribute('disabled')).toBe(true);
  });

  it('enables confirm button after selecting a reviewer', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const assignBtns = screen.getAllByRole('button', { name: /asignar$/i });
    await act(async () => {
      fireEvent.click(assignBtns[0]);
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar asignación/i });
    expect(confirmBtn.hasAttribute('disabled')).toBe(false);
  });

  it('calls assignReviewers service on confirm', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });

    const assignBtns = screen.getAllByRole('button', { name: /asignar$/i });
    await act(async () => {
      fireEvent.click(assignBtns[0]);
    });

    const confirmBtn = screen.getByRole('button', { name: /confirmar asignación/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(mockEvaluacionService.assignReviewers).toHaveBeenCalledWith(1, [10]);
    });
  });

  it('shows back navigation link', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });
    const backLink = screen.getByRole('link', { name: /volver al proyecto/i });
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/projects/1');
  });

  it('shows empty state when no reviewers found', async () => {
    mockUserService.getReviewers.mockResolvedValue([]);
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron docentes/i)).toBeDefined();
    });
  });

  it('shows assigned jurors section', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });
    expect(screen.getAllByText(/jurados asignados/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows no jurors assigned message initially', async () => {
    renderWithProviders(<AssignReviewers />);
    await waitFor(() => {
      expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    });
    expect(screen.getByText(/no hay jurados asignados/i)).toBeDefined();
  });
});
