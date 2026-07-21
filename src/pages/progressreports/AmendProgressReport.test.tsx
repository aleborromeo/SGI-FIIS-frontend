import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AmendProgressReport } from './AmendProgressReport';
import { progressReportService } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getDetail: vi.fn(),
    amendReport: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '5' }),
  };
});

const mockProgressReportService = vi.mocked(progressReportService);
const mockDocumentService = vi.mocked(documentService);

const mockReport = {
  id: 5,
  projectId: 10,
  projectTitle: 'Proyecto de IA',
  reportType: 'PARCIAL',
  period: 'T1-2026',
  status: 'OBSERVADO',
  physicalProgress: 50,
  financialProgress: 40,
  achievements: 'Primeros logros',
  difficulties: 'Problemas encontrados',
  recommendations: 'Recomendaciones',
  observations: 'Necesita correcciones',
  submittedAt: '2026-03-01T10:00:00Z',
  attachedDocumentId: null,
  executedActivities: [],
  attachments: [],
  comments: [{ id: 1, authorName: 'Director', authorRole: 'DIRECTOR', content: 'Necesita correcciones', createdAt: '2026-03-02T10:00:00Z' }],
  evidences: [],
  changeHistory: [],
};

describe('AmendProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getDetail.mockResolvedValue(mockReport as any);
    mockProgressReportService.amendReport.mockResolvedValue({ id: 5 } as any);
    mockDocumentService.upload.mockResolvedValue({ id: 20, originalName: 'correccion.pdf' } as any);
  });

  it('shows loading state', () => {
    mockProgressReportService.getDetail.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockReport as any), 1000))
    );
    renderWithProviders(<AmendProgressReport />);
    expect(screen.getByText(/Cargando datos del informe/i)).toBeDefined();
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders report data after load', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(screen.getByText(/Subsanar Informe de Avance #5/)).toBeDefined();
  });

  it('displays observation comments', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(screen.getByText('Necesita correcciones')).toBeDefined();
    expect(screen.getByText(/Observación Registrada/)).toBeDefined();
  });

  it('displays context data', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(screen.getByText(/Proyecto de IA/)).toBeDefined();
    expect(screen.getByText(/T1-2026/)).toBeDefined();
    expect(screen.getByText(/50%/)).toBeDefined();
    expect(screen.getByText('OBSERVADO')).toBeDefined();
  });

  it('shows file upload area', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();
    expect(fileInput.accept).toBe('.pdf,.doc,.docx');
  });

  it('shows error when submitting without document', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /enviar correcciones/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockProgressReportService.amendReport).not.toHaveBeenCalled();
  });

  it('navigates to history on successful submit', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'correccion.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /enviar correcciones/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(mockProgressReportService.amendReport).toHaveBeenCalledWith(5, { amendmentDocumentId: 20 });
      expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
    });
  });

  it('handles submit error', async () => {
    mockProgressReportService.amendReport.mockRejectedValue(new Error('Error al subsanar'));
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'correccion.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /enviar correcciones/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows not found state when report is null', async () => {
    mockProgressReportService.getDetail.mockResolvedValue(null as any);
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(screen.getByText(/Error/i)).toBeDefined();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
  });
});
