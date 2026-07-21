import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AmendProgressReport } from './AmendProgressReport';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';

const { mockGetDetail, mockAmendReport, mockUpload } = vi.hoisted(() => ({
  mockGetDetail: vi.fn(),
  mockAmendReport: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getDetail: mockGetDetail,
    amendReport: mockAmendReport,
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: { upload: mockUpload },
}));

const baseReport = {
  id: 1,
  reportNumber: 1,
  projectId: 10,
  projectTitle: 'Proyecto de Riego',
  responsibleName: 'Docente A',
  reportDate: '2026-01-01T10:00:00Z',
  physicalProgress: 50,
  financialProgress: 50,
  status: 'OBSERVADO',
  observations: 'obs',
  comments: [
    {
      id: 1,
      authorName: 'Director',
      authorRole: 'DIRECTOR_INVESTIGACION',
      content: 'Corregir el formato del informe',
      createdAt: '2026-01-02T10:00:00Z',
    },
  ],
  executedActivities: [],
  evidences: [],
  attachments: [],
  changeHistory: [],
} as any;

const renderPage = (id = '1') =>
  render(
    <MemoryRouter initialEntries={[`/progressreports/amend/${id}`]}>
      <ToastProvider>
        <AuthContext.Provider value={{ currentRole: 'DIRECTOR_INVESTIGACION' } as any}>
          <Routes>
            <Route path="/progressreports/amend/:id" element={<AmendProgressReport />} />
          </Routes>
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>
  );

describe('AmendProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetDetail.mockResolvedValue(baseReport);
    mockAmendReport.mockResolvedValue(baseReport);
    mockUpload.mockResolvedValue({ id: 99 });
  });

  it('renders the amendment title and the registered observation', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /Subsanar Informe de Avance #1/i })
    ).toBeDefined();
    expect(await screen.findByText('Corregir el formato del informe')).toBeDefined();
  });

  it('shows a not-found message when the report cannot be loaded', async () => {
    mockGetDetail.mockRejectedValue(new Error('not found'));
    renderPage();
    expect(await screen.findByText(/No se pudo obtener el informe/i)).toBeDefined();
  });

  it('submits the amendment with the uploaded document', async () => {
    renderPage();
    await screen.findByRole('heading', { name: /Subsanar Informe de Avance #1/i });

    const file = new File(['x'], 'corregido.pdf', { type: 'application/pdf' });
    fireEvent.change(document.getElementById('amendment-file') as HTMLElement, {
      target: { files: [file] },
    });
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    fireEvent.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);

    await waitFor(() => expect(mockAmendReport).toHaveBeenCalled());
    expect(mockAmendReport).toHaveBeenCalledWith(1, { amendmentDocumentId: 99 });
    expect(await screen.findByText(/enviada exitosamente/i)).toBeDefined();
  });
});
