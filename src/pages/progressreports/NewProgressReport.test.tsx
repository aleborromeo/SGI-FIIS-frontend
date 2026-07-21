import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { NewProgressReport } from './NewProgressReport';
import { progressReportService } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: vi.fn(),
    createReport: vi.fn(),
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
  };
});

const mockProgressReportService = vi.mocked(progressReportService);
const mockDocumentService = vi.mocked(documentService);

const mockProjects = [
  { id: 1, title: 'Proyecto de IA', status: 'EN_EJECUCION' },
  { id: 2, title: 'Proyecto Blockchain', status: 'APROBADO' },
];

async function fillFormAndUpload() {
  await act(async () => {
    const projectSelect = document.getElementById('select-project-new-report') as HTMLSelectElement;
    projectSelect.selectedIndex = 1;
    fireEvent.change(projectSelect);
  });
  await act(async () => {
    fireEvent.change(screen.getByPlaceholderText(/Primer Trimestre/i), { target: { value: 'T1-2026' } });
  });
  await act(async () => {
    fireEvent.change(document.getElementById('input-achievements') as HTMLTextAreaElement, { target: { value: 'Logros completados' } });
  });
  await act(async () => {
    fireEvent.change(document.getElementById('input-difficulties') as HTMLTextAreaElement, { target: { value: 'Algunas dificultades' } });
  });
  await act(async () => {
    fireEvent.change(document.getElementById('input-recommendations') as HTMLTextAreaElement, { target: { value: 'Recomendaciones' } });
  });
}

async function submitForm() {
  const submitBtn = screen.getByRole('button', { name: /enviar informe/i });
  await act(async () => {
    fireEvent.click(submitBtn);
  });
}

describe('NewProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getProjectsByRole.mockResolvedValue(mockProjects as any);
    mockProgressReportService.createReport.mockResolvedValue({ id: 1 } as any);
    mockDocumentService.upload.mockResolvedValue({ id: 10, originalName: 'informe.pdf' } as any);
  });

  it('renders title and form after loading projects', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    expect(screen.getByText('Registrar Nuevo Informe de Avance')).toBeDefined();
    expect(document.getElementById('select-project-new-report')).toBeDefined();
  });

  it('shows loading state for projects', () => {
    mockProgressReportService.getProjectsByRole.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<NewProgressReport />);
    expect(screen.getByText(/Cargando proyectos/i)).toBeDefined();
  });

  it('populates project select with fetched projects', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const select = document.getElementById('select-project-new-report') as HTMLSelectElement;
    expect(select).toBeDefined();
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(screen.getByText(/Proyecto de IA/)).toBeDefined();
    expect(screen.getByText(/Proyecto Blockchain/)).toBeDefined();
  });

  it('allows report type selection', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const select = document.getElementById('select-report-type') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'FINAL' } });
    expect(select.value).toBe('FINAL');
  });

  it('allows period input', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const input = screen.getByPlaceholderText(/Primer Trimestre/i);
    fireEvent.change(input, { target: { value: 'T1-2026' } });
    expect((input as HTMLInputElement).value).toBe('T1-2026');
  });

  it('handles valid progress percentage input', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '50' } });
    expect((input as HTMLInputElement).value).toBe('50');
  });

  it('clamps negative progress percentage to 0', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-10' } });
    expect((input as HTMLInputElement).value).toBe('0');
  });

  it('clamps progress percentage > 100 to 100', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '150' } });
    expect((input as HTMLInputElement).value).toBe('100');
  });

  it('allows text area fields to work', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(3);
    fireEvent.change(textareas[0], { target: { value: 'Logros completados' } });
    expect((textareas[0] as HTMLTextAreaElement).value).toBe('Logros completados');
  });

  it('shows file upload area', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();
    expect(fileInput.accept).toBe('.pdf,.doc,.docx');
  });

  it('shows error when submitting without project', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /enviar informe/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockProgressReportService.createReport).not.toHaveBeenCalled();
  });

  it('shows error when submitting without period', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    fireEvent.change(document.getElementById('select-project-new-report') as HTMLSelectElement, { target: { value: '1' } });
    const submitBtn = screen.getByRole('button', { name: /enviar informe/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockProgressReportService.createReport).not.toHaveBeenCalled();
  });

  it('shows error when submitting without text fields', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    fireEvent.change(document.getElementById('select-project-new-report') as HTMLSelectElement, { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/Primer Trimestre/i), { target: { value: 'T1-2026' } });
    const submitBtn = screen.getByRole('button', { name: /enviar informe/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockProgressReportService.createReport).not.toHaveBeenCalled();
  });

  it('shows error when submitting without document', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    await fillFormAndUpload();
    const submitBtn = screen.getByRole('button', { name: /enviar informe/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(mockProgressReportService.createReport).not.toHaveBeenCalled();
  });

  it('navigates to history on successful submit', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});

    await fillFormAndUpload();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'informe.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockDocumentService.upload).toHaveBeenCalled();
    });

    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(mockProgressReportService.createReport).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
    });
  });

  it('handles submit error', async () => {
    mockProgressReportService.createReport.mockRejectedValue(new Error('Error del servidor'));

    renderWithProviders(<NewProgressReport />);
    await act(async () => {});

    await fillFormAndUpload();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'informe.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockDocumentService.upload).toHaveBeenCalled();
    });

    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(mockProgressReportService.createReport).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
  });

  it('shows loading state during submit', async () => {
    let resolveCreate: any;
    mockProgressReportService.createReport.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; })
    );
    mockDocumentService.upload.mockResolvedValue({ id: 10, originalName: 'informe.pdf' } as any);

    renderWithProviders(<NewProgressReport />);
    await act(async () => {});

    await fillFormAndUpload();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'informe.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockDocumentService.upload).toHaveBeenCalled();
    });

    await act(async () => {
      submitForm();
    });

    await waitFor(() => {
      expect(screen.getByText(/Guardando/i)).toBeDefined();
    });

    await act(async () => {
      resolveCreate({ id: 1 });
    });
  });
});
