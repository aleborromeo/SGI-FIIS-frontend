import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../../context/ToastContext';
import { ResolutionsPage } from './ResolutionsPage';

const { mockIssueResolution } = vi.hoisted(() => ({
  mockIssueResolution: vi.fn(),
}));

vi.mock('../../services/resolutionService', () => ({
  resolutionService: { issueResolution: mockIssueResolution },
}));

describe('ResolutionsPage (#161)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockIssueResolution.mockResolvedValue({});
  });

  it('renders the resolution registration form', async () => {
    render(
      <ToastProvider>
        <ResolutionsPage />
      </ToastProvider>
    );

    expect(await screen.findByText('Registro de Resoluciones')).toBeInTheDocument();
    expect(screen.getByText('Nueva Resolución')).toBeInTheDocument();
  });

  it('shows an error when submitting without a file', async () => {
    render(
      <ToastProvider>
        <ResolutionsPage />
      </ToastProvider>
    );

    const form = document.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(
      (await screen.findAllByText('Debe adjuntar el archivo de la resolución')).length
    ).toBeGreaterThan(0);
    expect(mockIssueResolution).not.toHaveBeenCalled();
  });

  it('registers a resolution when all fields and a file are provided', async () => {
    render(
      <ToastProvider>
        <ResolutionsPage />
      </ToastProvider>
    );

    fireEvent.change(screen.getByLabelText('Número de Resolución'), {
      target: { value: 'R-2026-001' },
    });
    fireEvent.change(screen.getByLabelText('Fecha de Emisión'), {
      target: { value: '2026-05-10' },
    });
    fireEvent.change(screen.getByPlaceholderText('ID del trámite aprobado'), {
      target: { value: '42' },
    });
    fireEvent.change(screen.getByPlaceholderText('Descripción del asunto resolutivo...'), {
      target: { value: 'Asunto de prueba' },
    });

    const fileInput = document.getElementById('resolution-upload') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['x'], 'resolucion.pdf', { type: 'application/pdf' })] },
    });

    const submit = await screen.findByRole('button', { name: 'Registrar Resolución' });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mockIssueResolution).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroResolucion: 'R-2026-001',
          asunto: 'Asunto de prueba',
          idTramite: '42',
        })
      )
    );
  });
});
