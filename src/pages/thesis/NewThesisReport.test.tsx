import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { NewThesisReport } from './NewThesisReport';
import { thesisService } from '../../services/thesisService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: vi.fn(),
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
    useParams: () => ({ planId: '1' }),
    Link: ({ to, children, ...rest }: any) => (
      <a href={to} {...rest}>{children}</a>
    ),
  };
});

const mockThesisService = vi.mocked(thesisService);
const mockDocumentService = vi.mocked(documentService);

const mockPlan = {
  idPlanTesis: 1,
  tituloTesis: 'Sistema de Monitoreo de Red',
  title: 'Sistema de Monitoreo de Red',
  estadoPlan: 'APROBADO',
  status: 'APPROVED',
};

function createFile(name: string, type: string): File {
  const content = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return new File([content], name, { type });
}

describe('NewThesisReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThesisService.getPlanById.mockResolvedValue(mockPlan as any);
    mockThesisService.createReport.mockResolvedValue({ id: 1 } as any);
    mockDocumentService.upload.mockResolvedValue({ id: 10, originalName: 'tesis.pdf', extension: 'pdf' } as any);
  });

  it('shows loading state while plan loads', () => {
    mockThesisService.getPlanById.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<NewThesisReport />);
    expect(screen.getByText(/cargando datos del plan/i)).toBeDefined();
  });

  it('renders form after loading plan', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    expect(screen.getByText(/registrar informe de tesis/i)).toBeDefined();
    expect(screen.getByText(/título final de la tesis/i)).toBeDefined();
  });

  it('pre-fills title from plan', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox');
    expect((titleInput as HTMLInputElement).value).toBe('Sistema de Monitoreo de Red');
  });

  it('allows editing the title', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título Actualizado' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Título Actualizado');
  });

  it('renders file upload input', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();
  });

  it('uploads file on selection', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('tesis.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(mockDocumentService.upload).toHaveBeenCalledWith(file);
  });

  it('shows uploaded file name', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('tesis.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('tesis.pdf')).toBeDefined();
  });

  it('rejects invalid file formats', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('image.png', 'image/png');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(mockDocumentService.upload).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('tesis.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /enviar tesis/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockThesisService.createReport).toHaveBeenCalledWith(expect.objectContaining({
      idPlanTesis: 1,
      idDocumentoTesis: 10,
    }));
  });

  it('navigates to traceability page on success', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('tesis.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /enviar tesis/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/thesis/plan/1');
  });

  it('shows error on submit failure', async () => {
    mockThesisService.createReport.mockRejectedValue(new Error('Error al registrar'));
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('tesis.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /enviar tesis/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getAllByText('Error al registrar').length).toBeGreaterThanOrEqual(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates back when cancel button is clicked', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/thesis/plan/1');
  });

  it('renders cancel and submit buttons', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /enviar tesis/i })).toBeDefined();
  });

  it('shows error state when plan fails to load', async () => {
    mockThesisService.getPlanById.mockRejectedValue(new Error('Plan no encontrado'));
    renderWithProviders(<NewThesisReport />);
    await waitFor(() => {
      expect(screen.getByText(/no se encontró/i)).toBeDefined();
    }, { timeout: 3000 });
  });
});
