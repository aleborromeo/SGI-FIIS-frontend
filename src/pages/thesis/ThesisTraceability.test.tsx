import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { ThesisTraceability } from './ThesisTraceability';

const {
  mockGetPlanById,
  mockGetReportByPlanId,
  mockApproveCoordinator,
  mockApproveDirector,
  mockGetGroupById,
  mockDownloadFile,
  mockUpload,
} = vi.hoisted(() => ({
  mockGetPlanById: vi.fn(),
  mockGetReportByPlanId: vi.fn(),
  mockApproveCoordinator: vi.fn(),
  mockApproveDirector: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockDownloadFile: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: mockGetPlanById,
    getReportByPlanId: mockGetReportByPlanId,
    approveCoordinator: mockApproveCoordinator,
    approveDirector: mockApproveDirector,
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: { getGroupById: mockGetGroupById },
}));

vi.mock('../../services/documentService', () => ({
  documentService: { downloadFile: mockDownloadFile, upload: mockUpload },
}));

const renderPage = (role: string, planId = '10') =>
  render(
    <ToastProvider>
      <AuthContext.Provider value={{ currentRole: role } as any}>
        <MemoryRouter initialEntries={[`/thesis/plan/${planId}`]}>
          <Routes>
            <Route path="/thesis/plan/:id" element={<ThesisTraceability />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ToastProvider>
  );

describe('ThesisTraceability (#158)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetReportByPlanId.mockRejectedValue(new Error('no report'));
    mockGetGroupById.mockResolvedValue({});
    mockDownloadFile.mockResolvedValue(undefined);
    mockUpload.mockResolvedValue({ id: 1 });
    mockApproveCoordinator.mockResolvedValue({});
    mockApproveDirector.mockResolvedValue({});
  });

  it('renders the plan traceability details', async () => {
    mockGetPlanById.mockResolvedValue({
      idPlanTesis: 10,
      tituloTesis: 'Mi tesis de grado',
      estadoPlan: 'PENDIENTE',
      revisorActual: 'ESTUDIANTE',
    });
    renderPage('ESTUDIANTE');

    expect(
      await screen.findByRole('heading', { name: /Trazabilidad/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Mi tesis de grado')).toBeInTheDocument();
  });

  it('shows an error when the plan cannot be loaded', async () => {
    mockGetPlanById.mockRejectedValue(new Error('Plan inexistente'));
    renderPage('ESTUDIANTE');

    expect(await screen.findByText(/Plan inexistente/i)).toBeInTheDocument();
  });

  it('allows a coordinator to approve the plan', async () => {
    mockGetPlanById.mockResolvedValue({
      idPlanTesis: 10,
      tituloTesis: 'Mi tesis de grado',
      estadoPlan: 'PENDIENTE',
      revisorActual: 'COORDINADOR_GRUPO',
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage('COORDINADOR_GRUPO');

    const approve = await screen.findByRole('button', { name: /Aprobar/i });
    fireEvent.click(approve);

    await waitFor(() => expect(mockApproveCoordinator).toHaveBeenCalledWith('10'));
  });
});
