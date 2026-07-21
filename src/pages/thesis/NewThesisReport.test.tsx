import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { NewThesisReport } from './NewThesisReport';

const { mockGetPlanById, mockCreateReport, mockUpload } = vi.hoisted(() => ({
  mockGetPlanById: vi.fn(),
  mockCreateReport: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('../../services/thesisService', () => ({
  thesisService: { getPlanById: mockGetPlanById, createReport: mockCreateReport },
}));

vi.mock('../../services/documentService', () => ({
  documentService: { upload: mockUpload },
}));

const renderPage = (planId = '5') =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/thesis/report/new/${planId}`]}>
        <Routes>
          <Route path="/thesis/report/new/:planId" element={<NewThesisReport />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );

describe('NewThesisReport (#156)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpload.mockResolvedValue({ id: 55, originalName: 'tesis.pdf', extension: 'PDF' });
    mockCreateReport.mockResolvedValue({});
  });

  it('renders the report form after loading the plan', async () => {
    mockGetPlanById.mockResolvedValue({
      idPlanTesis: 5,
      title: 'Tesis de prueba',
      idDocumentoActual: 1,
    });
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Registrar Informe de Tesis Final' })
    ).toBeInTheDocument();
    const titleInput = document.getElementById('input-thesis-final-title') as HTMLInputElement;
    expect(titleInput.value).toBe('Tesis de prueba');
  });

  it('shows the not-found UI when the plan is not found', async () => {
    mockGetPlanById.mockRejectedValue(new Error('Plan inexistente'));
    renderPage();

    expect(
      await screen.findByRole('button', { name: 'Volver a Planes de Tesis' })
    ).toBeInTheDocument();
  });

  it('submits the report and calls thesisService.createReport', async () => {
    mockGetPlanById.mockResolvedValue({
      idPlanTesis: 5,
      title: 'Tesis de prueba',
      idDocumentoActual: 1,
    });
    renderPage('5');

    await waitFor(() =>
      expect(screen.getByText('Registrar Informe de Tesis Final')).toBeInTheDocument()
    );

    const fileInput = document.getElementById('attached-thesis-file') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['x'], 'tesis.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    const submit = screen.getByRole('button', { name: 'Enviar Tesis' });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mockCreateReport).toHaveBeenCalledWith(
        expect.objectContaining({
          idPlanTesis: 5,
          tituloFinal: 'Tesis de prueba',
          idDocumentoTesis: 55,
        })
      )
    );
  });
});
