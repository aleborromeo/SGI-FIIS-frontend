import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ProjectMonitoring } from './ProjectMonitoring';
import { projectService } from '../../services/projectService';
import { progressReportService } from '../../services/progressReportService';
import { userService } from '../../services/userService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/projectService', () => ({
  projectService: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
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
    list: vi.fn(),
    downloadFile: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);
const mockProgressReportService = vi.mocked(progressReportService);
const mockUserService = vi.mocked(userService);
const mockDocumentService = vi.mocked(documentService);

const mockProject = {
  id: 1,
  code: 'PRY-001',
  title: 'Proyecto de IA en Salud',
  status: 'APROBADO',
  researchLine: 'Computación',
  researchLineName: 'Computación',
  researchGroup: 'GI-SOFT',
  researchGroupCode: 'GI-SOFT',
  responsibleId: 1,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  budget: 50000,
  summary: 'RESUMEN: Investigación sobre IA.\nOBJETIVOS ESPECÍFICOS: Desarrollar modelos.\nMETODOLOGÍA: Experimental.',
  generalObjective: 'Desarrollar un sistema de IA para diagnóstico médico.',
  executionPlace: 'Laboratorio FIIS - Piso 3',
  teamMembers: [],
  documentId: 1,
};

describe('ProjectMonitoring', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProjectService.getById.mockResolvedValue(mockProject as any);
    mockProjectService.updateStatus.mockResolvedValue({ ...mockProject, status: 'IN_PROGRESS' } as any);
    mockProgressReportService.getByProject.mockResolvedValue([]);
    mockUserService.getAllUsers.mockResolvedValue([]);
    mockUserService.getById.mockResolvedValue({
      id: 1,
      firstNames: 'Juan',
      lastNames: 'Pérez',
      dni: '12345678',
      institutionalEmail: 'juan@sgi.com',
      roleCode: 'DOCENTE_INVESTIGADOR',
      roleDescription: 'Docente Investigador',
      active: true,
    } as any);
    mockDocumentService.list.mockResolvedValue([{
      id: 1,
      fileName: 'Proyecto_inicial.pdf',
      fileUrl: '/docs/1',
      fileType: 'pdf',
      active: true,
    }] as any);
  });

  it('shows loading state', () => {
    mockProjectService.getById.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockProject as any), 1000))
    );
    renderWithProviders(<ProjectMonitoring />);
    expect(screen.getByText(/cargando detalle del proyecto/i)).toBeDefined();
  });

  it('renders project title after loading', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA en Salud')).toBeDefined();
    });
  });

  it('renders back link to projects', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA en Salud')).toBeDefined();
    });
    const backLinks = screen.getAllByRole('link');
    const projectsLink = backLinks.find(l => l.getAttribute('href') === '/projects');
    expect(projectsLink).toBeDefined();
  });

  it('renders responsible user name', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeDefined();
    });
  });

  it('renders project code badge', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('PRY-001')).toBeDefined();
    });
  });

  it('renders summary section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/resumen y detalles de la propuesta/i)).toBeDefined();
    });
  });

  it('renders parsed summary sections', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/investigación sobre ia/i)).toBeDefined();
    });
  });

  it('renders general objective section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/objetivo general/i)).toBeDefined();
    });
    expect(screen.getByText(/desarrollar un sistema de ia/i)).toBeDefined();
  });

  it('renders progress section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/progreso general del proyecto/i)).toBeDefined();
    });
  });

  it('renders reports table section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getAllByText(/informes trimestrales/i).length).toBeGreaterThan(0);
    });
  });

  it('renders reports with trimester periods', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Trimestre 1')).toBeDefined();
    });
    expect(screen.getByText('Trimestre 2')).toBeDefined();
  });

  it('renders documents section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/documentos del expediente/i)).toBeDefined();
    });
  });

  it('renders signature tracking section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/trazabilidad de firmas/i)).toBeDefined();
    });
  });

  it('renders admin details section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/detalles administrativos/i)).toBeDefined();
    });
  });

  it('renders budget info', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA en Salud')).toBeDefined();
    });
    expect(screen.getAllByText('S/ 50,000.00').length).toBeGreaterThan(0);
  });

  it('renders move to execution button', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA en Salud')).toBeDefined();
    });
    expect(screen.getByText(/pasar a ejecución/i)).toBeDefined();
  });

  it('renders error state when project not found', async () => {
    mockProjectService.getById.mockRejectedValue(new Error('No encontrado'));
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/no se pudo cargar el proyecto/i)).toBeDefined();
    });
  });

  it('renders help section', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/¿necesitas ayuda\?/i)).toBeDefined();
    });
  });

  it('renders current status badge', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/estado actual/i)).toBeDefined();
    });
  });

  it('renders institutional rule note', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText(/regla institucional/i)).toBeDefined();
    });
  });

  it('renders move to execution and calls service', async () => {
    renderWithProviders(<ProjectMonitoring />);
    await waitFor(() => {
      expect(screen.getByText('Proyecto de IA en Salud')).toBeDefined();
    });

    const executionBtn = screen.getByRole('button', { name: /pasar a ejecución/i });
    await act(async () => {
      fireEvent.click(executionBtn);
    });

    await waitFor(() => {
      expect(mockProjectService.updateStatus).toHaveBeenCalledWith('1', 'IN_PROGRESS');
    });
  });
});
