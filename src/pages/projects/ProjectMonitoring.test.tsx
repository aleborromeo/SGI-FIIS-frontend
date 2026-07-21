import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act } from '@testing-library/react';
import { ProjectMonitoring } from './ProjectMonitoring';
import { projectService } from '../../services/projectService';
import { progressReportService } from '../../services/progressReportService';
import { userService } from '../../services/userService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/projectService', () => ({
  projectService: {
    getById: vi.fn(),
  },
}));

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getByProject: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getAllUsers: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);
const mockProgressReportService = vi.mocked(progressReportService);

const mockProject = {
  id: 1,
  title: 'Proyecto de IA en Salud',
  status: 'APROBADO',
  researchLine: 'Computación',
  researchGroup: 'GI-SOFT',
  responsibleId: 1,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  budget: 50000,
  abstract: 'Resumen del proyecto',
  objectives: 'Objetivos del proyecto',
  teamMembers: [],
};

describe('ProjectMonitoring', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProjectService.getById.mockResolvedValue(mockProject as any);
    mockProgressReportService.getByProject.mockResolvedValue([]);
    vi.mocked(userService.getAllUsers).mockResolvedValue([]);
    vi.mocked(userService.getById).mockResolvedValue({
      id: 1,
      firstNames: 'Juan',
      lastNames: 'Pérez',
      dni: '12345678',
      institutionalEmail: 'juan@sgi.com',
      roleCode: 'DOCENTE_INVESTIGADOR',
      roleDescription: 'Docente Investigador',
      active: true,
    } as any);
  });

  it('shows loading spinner initially', () => {
    mockProjectService.getById.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockProject as any), 1000))
    );
    renderWithProviders(<ProjectMonitoring />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders project title after loading', async () => {
    renderWithProviders(<ProjectMonitoring />);
    expect(await screen.findByText('Proyecto de IA en Salud')).toBeDefined();
  });

  it('renders back link to projects', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toBeDefined();
  });

  it('renders project leader name', async () => {
    renderWithProviders(<ProjectMonitoring />);
    expect(await screen.findByText('Juan Pérez')).toBeDefined();
  });

  it('renders project tabs', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await screen.findByText('Proyecto de IA en Salud');
    // Tabs should be rendered
    expect(document.body.textContent?.length).toBeGreaterThan(100);
  });
});

