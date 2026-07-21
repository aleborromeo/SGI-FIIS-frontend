import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { ProjectMonitoring } from './ProjectMonitoring';

const {
  mockGetById,
  mockUpdateStatus,
  mockGetByProject,
  mockList,
  mockDownloadFile,
  mockUserGetById,
} = vi.hoisted(() => ({
  mockGetById: vi.fn(),
  mockUpdateStatus: vi.fn(),
  mockGetByProject: vi.fn(),
  mockList: vi.fn(),
  mockDownloadFile: vi.fn(),
  mockUserGetById: vi.fn(),
}));

vi.mock('../../services/projectService', () => ({
  projectService: { getById: mockGetById, updateStatus: mockUpdateStatus },
}));
vi.mock('../../services/progressReportService', () => ({
  progressReportService: { getByProject: mockGetByProject },
}));
vi.mock('../../services/documentService', () => ({
  documentService: { list: mockList, downloadFile: mockDownloadFile },
}));
vi.mock('../../services/userService', () => ({
  userService: { getById: mockUserGetById },
}));

const baseProject = {
  id: 1,
  code: 'PRY-1',
  title: 'Proyecto de Riego Inteligente',
  status: 'EN_EJECUCION',
  summary: 'RESUMEN: Mejorar el riego. OBJETIVOS ESPECÍFICOS: Optimizar recursos.',
  generalObjective: 'Mejorar el sistema de riego',
  budget: 1000,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const renderWithProviders = (role = 'COORDINADOR_GRUPO', id = '1') =>
  render(
    <MemoryRouter initialEntries={[`/projects/${id}`]}>
      <AuthContext.Provider value={{ currentRole: role } as any}>
        <ToastProvider>
          <Routes>
            <Route path="/projects/:id" element={<ProjectMonitoring />} />
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('ProjectMonitoring', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetById.mockResolvedValue(baseProject);
    mockGetByProject.mockResolvedValue([]);
    mockList.mockResolvedValue([]);
    mockUserGetById.mockResolvedValue({ firstNames: 'Ana', lastNames: 'Lopez' });
    mockUpdateStatus.mockResolvedValue({ ...baseProject, status: 'IN_PROGRESS' });
  });

  it('renders the project title and summary section without crashing', async () => {
    renderWithProviders();
    expect(await screen.findByText('Proyecto de Riego Inteligente')).toBeDefined();
    expect(screen.getByText('Resumen y Detalles de la Propuesta')).toBeDefined();
    expect(screen.getByText('Informes Trimestrales y Final de Ejecución')).toBeDefined();
  });

  it('calls projectService.updateStatus when moving the project to execution', async () => {
    renderWithProviders();
    await screen.findByText('Proyecto de Riego Inteligente');
    const button = screen.getByRole('button', { name: /Pasar a ejecuci/i });
    fireEvent.click(button);
    await waitFor(() =>
      expect(mockUpdateStatus).toHaveBeenCalledWith('1', 'IN_PROGRESS')
    );
  });

  it('shows the Subsanar action for an observed report when role is DOCENTE_INVESTIGADOR', async () => {
    mockGetByProject.mockResolvedValue([
      {
        id: 5,
        period: 'Trimestre 1',
        status: 'OBSERVADO',
        attachedDocumentId: null,
        fileName: null,
      },
    ]);
    renderWithProviders('DOCENTE_INVESTIGADOR');
    expect(await screen.findByText(/Subsanar/i)).toBeDefined();
    expect(screen.getByText('Trimestre 1')).toBeDefined();
  });
});
