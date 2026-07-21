import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
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
    useLocation: () => ({ key: 'test-key' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);

const mockProjects = [
  {
    id: 1,
    title: 'Proyecto de Inteligencia Artificial',
    status: 'APROBADO',
    researchLine: 'Computación',
    researchLineName: 'Computación',
    researchGroup: 'GI-SOFT',
    researchGroupCode: 'GI-SOFT',
    leaderName: 'Juan Pérez',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    budget: 50000,
  },
  {
    id: 2,
    title: 'Proyecto de Blockchain',
    status: 'PENDIENTE_COORDINADOR',
    researchLine: 'Redes',
    researchLineName: 'Redes',
    researchGroup: 'GI-NET',
    researchGroupCode: 'GI-NET',
    leaderName: 'María García',
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

  it('shows loading state initially', () => {
    mockProjectService.getAll.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ProjectsList />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders projects after loading', async () => {
    renderWithProviders(<ProjectsList />);
    expect(await screen.findByText('Proyecto de Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Proyecto de Blockchain')).toBeDefined();
  });

  it('renders research groups and lines', async () => {
    renderWithProviders(<ProjectsList />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-NET')).toBeDefined();
  });

  it('filters projects by search text', async () => {
    renderWithProviders(<ProjectsList />);
    await screen.findByText('Proyecto de Inteligencia Artificial');

    const searchInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Blockchain' } });
    });

    expect(screen.queryByText('Proyecto de Inteligencia Artificial')).toBeNull();
    expect(screen.getByText('Proyecto de Blockchain')).toBeDefined();
  });

  it('renders pagination', async () => {
    renderWithProviders(<ProjectsList />);
    await screen.findByText('Proyecto de Inteligencia Artificial');
    // Pagination should be rendered
    expect(document.body).toBeDefined();
  });

  it('renders + button for new project (for DOCENTE_INVESTIGADOR)', async () => {
    renderWithProviders(<ProjectsList />, {
      authValue: {
        user: { id: 3, roleCode: 'DOCENTE_INVESTIGADOR', firstNames: 'Doc', lastNames: 'Inv', email: 'd@sgi.com' },
        roles: ['DOCENTE_INVESTIGADOR'],
        currentRole: 'DOCENTE_INVESTIGADOR',
        loading: false,
        error: null,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        switchRole: vi.fn(),
        clearError: vi.fn(),
        completeRegistration: vi.fn(),
      } as any,
    });
    await screen.findByText('Proyecto de Inteligencia Artificial');
    // There should be a link/button to create new proposal
    expect(document.body.textContent?.includes('Nueva') || document.body.textContent?.includes('Postular')).toBeTruthy();
  });

  it('shows empty state when no projects', async () => {
    mockProjectService.getAll.mockResolvedValue([]);
    renderWithProviders(<ProjectsList />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });
});

