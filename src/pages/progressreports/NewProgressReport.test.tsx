import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NewProgressReport } from './NewProgressReport';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';

const { mockGetProjectsByRole, mockCreateReport, mockUpload } = vi.hoisted(() => ({
  mockGetProjectsByRole: vi.fn(),
  mockCreateReport: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: mockGetProjectsByRole,
    createReport: mockCreateReport,
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: { upload: mockUpload },
}));

const authValue = {
  currentRole: 'DOCENTE_INVESTIGADOR',
  user: { id: 1 },
  roles: [],
  isAuthenticated: true,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
  clearError: vi.fn(),
  completeRegistration: vi.fn(),
} as any;

const renderPage = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <NewProgressReport />
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>
  );

const attachedFileInput = () => document.getElementById('attached-file') as HTMLInputElement;

describe('NewProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetProjectsByRole.mockResolvedValue([
      { id: 5, title: 'Proyecto de Riego', status: 'EN_EJECUCION' },
    ]);
    mockCreateReport.mockResolvedValue({ id: 1 });
    mockUpload.mockResolvedValue({ id: 99 });
  });

  it('renders the page title and loads the project list', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /Registrar Nuevo Informe de Avance/i })
    ).toBeDefined();
    expect(await screen.findByText(/Proyecto de Riego/)).toBeDefined();
  });

  it('shows an error message when report creation fails', async () => {
    mockCreateReport.mockRejectedValue(new Error('Fallo guardando'));
    renderPage();
    await screen.findByText(/Proyecto de Riego/);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '5' } });
    fireEvent.change(document.getElementById('input-period') as HTMLElement, {
      target: { value: 'Trimestre 1' },
    });
    fireEvent.change(document.getElementById('input-achievements') as HTMLElement, {
      target: { value: 'Logros' },
    });
    fireEvent.change(document.getElementById('input-difficulties') as HTMLElement, {
      target: { value: 'Dificultades' },
    });
    fireEvent.change(document.getElementById('input-recommendations') as HTMLElement, {
      target: { value: 'Recomendaciones' },
    });

    const file = new File(['x'], 'informe.pdf', { type: 'application/pdf' });
    fireEvent.change(attachedFileInput(), { target: { files: [file] } });
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    fireEvent.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);

    expect(await screen.findByText(/Error al registrar/)).toBeDefined();
    expect(mockCreateReport).toHaveBeenCalled();
  });

  it('creates the report with the form payload on successful submit', async () => {
    renderPage();
    await screen.findByText(/Proyecto de Riego/);

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '5' } });
    fireEvent.change(document.getElementById('input-period') as HTMLElement, {
      target: { value: 'Trimestre 1' },
    });
    fireEvent.change(document.getElementById('input-achievements') as HTMLElement, {
      target: { value: 'Logros alcanzados' },
    });
    fireEvent.change(document.getElementById('input-difficulties') as HTMLElement, {
      target: { value: 'Dificultades presentadas' },
    });
    fireEvent.change(document.getElementById('input-recommendations') as HTMLElement, {
      target: { value: 'Recomendaciones' },
    });

    const file = new File(['x'], 'informe.pdf', { type: 'application/pdf' });
    fireEvent.change(attachedFileInput(), { target: { files: [file] } });
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    fireEvent.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);

    await waitFor(() => expect(mockCreateReport).toHaveBeenCalled());
    expect(mockCreateReport).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 5,
        period: 'Trimestre 1',
        progressPercentage: 0,
        achievements: 'Logros alcanzados',
        difficulties: 'Dificultades presentadas',
        recommendations: 'Recomendaciones',
        attachedDocumentId: 99,
      })
    );
  });
});
