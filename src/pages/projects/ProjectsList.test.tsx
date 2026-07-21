import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsList } from './ProjectsList';
import { projectService } from '../../services/projectService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/projectService', () => ({
  projectService: {
    getAll: vi.fn(),
    getMyDrafts: vi.fn(),
    deleteDraft: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ key: 'test-key', pathname: '/projects' }),
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);

const mockProjects = [
  {
    id: 1,
    code: 'PRY-001',
    title: 'Proyecto de Inteligencia Artificial',
    summary: 'Investigación sobre IA aplicada a salud',
    status: 'APROBADO',
    researchLine: 'Computación',
    researchLineName: 'Computación',
    researchGroup: 'GI-SOFT',
    researchGroupCode: 'GI-SOFT',
    leaderName: 'Juan Pérez',
    responsibleId: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    budget: 50000,
  },
  {
    id: 2,
    code: 'PRY-002',
    title: 'Proyecto de Blockchain',
    summary: 'Investigación sobre cadenas de bloques',
    status: 'PENDIENTE_COORDINADOR',
    researchLine: 'Redes',
    researchLineName: 'Redes',
    researchGroup: 'GI-NET',
    researchGroupCode: 'GI-NET',
    leaderName: 'María García',
    responsibleId: 2,
    startDate: '2026-02-01',
    endDate: '2026-11-30',
    budget: 30000,
  },
];

describe('ProjectsList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProjectService.getAll.mockResolvedValue(mockProjects as any);
    mockProjectService.getMyDrafts.mockResolvedValue([]);
    mockProjectService.deleteDraft.mockResolvedValue(undefined);
  });

  it('renders projects after loading', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    expect(screen.getByText('Proyecto de Blockchain')).toBeDefined();
  });

  it('renders page heading', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyectos y tesis')).toBeDefined();
    });
  });

  it('shows empty state when no projects', async () => {
    mockProjectService.getAll.mockResolvedValue([]);
    mockProjectService.getMyDrafts.mockResolvedValue([]);
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  });

  it('renders summary cards with counts', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    expect(screen.getByText('Total registrados')).toBeDefined();
    expect(screen.getByText('Postulados')).toBeDefined();
  });

  it('filters projects by search text', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por código/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Blockchain' } });
    });

    expect(screen.queryByText('Proyecto de Inteligencia Artificial')).toBeNull();
    expect(screen.getByText('Proyecto de Blockchain')).toBeDefined();
  });

  it('renders research groups in table', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    expect(screen.getByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-NET')).toBeDefined();
  });

  it('renders new proposal button', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyectos y tesis')).toBeDefined();
    });
    const newLink = screen.getByRole('link', { name: /nueva propuesta/i });
    expect(newLink.getAttribute('href')).toBe('/projects/new');
  });

  it('renders view detail links', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    const detailLinks = screen.getAllByRole('link', { name: /ver detalle/i });
    expect(detailLinks.length).toBeGreaterThan(0);
  });

  it('renders projects table with status badges', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    const statusHeaders = screen.getAllByText(/código/i);
    expect(statusHeaders.length).toBeGreaterThan(0);
  });

  it('renders proposals tab by default', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyectos y tesis')).toBeDefined();
    });
    expect(screen.getAllByText(/propuestas/i).length).toBeGreaterThan(0);
  });

  it('renders drafts tab', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyectos y tesis')).toBeDefined();
    });
    expect(screen.getAllByText(/borradores/i).length).toBeGreaterThan(0);
  });

  it('renders refresh button', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(screen.getByText('Proyectos y tesis')).toBeDefined();
    });
    const refreshBtn = screen.getByRole('button', { name: /actualizar/i });
    expect(refreshBtn).toBeDefined();
  });

  it('calls projectService.getAll on mount', async () => {
    renderWithProviders(<ProjectsList />);
    await waitFor(() => {
      expect(mockProjectService.getAll).toHaveBeenCalled();
    });
  });

  it('renders reviewer assignment links', async () => {
    renderWithProviders(<ProjectsList />, {
      authValue: {
        user: { id: 1, roleCode: 'DIRECTOR_INVESTIGACION', firstNames: 'Dir', lastNames: 'Ector', email: 'dir@sgi.com' },
        roles: ['DIRECTOR_INVESTIGACION'],
        currentRole: 'DIRECTOR_INVESTIGACION',
        loading: false,
        error: null,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        switchRole: vi.fn(),
        clearError: vi.fn(),
        completeRegistration: vi.fn(),
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    });
    const reviewerLinks = screen.getAllByRole('link', { name: /revisores/i });
    expect(reviewerLinks.length).toBeGreaterThan(0);
  });
});
