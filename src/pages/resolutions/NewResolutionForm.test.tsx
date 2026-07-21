import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { NewResolutionForm } from './NewResolutionForm';

const { mockIssueResolution } = vi.hoisted(() => ({
  mockIssueResolution: vi.fn(),
}));

vi.mock('../../services/resolutionService', () => ({
  resolutionService: { issueResolution: mockIssueResolution },
}));

const renderPage = (search = '?procedureId=3&number=R-001&title=Asunto%20de%20prueba') =>
  render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/resolutions/new-legacy${search}`]}>
        <NewResolutionForm />
      </MemoryRouter>
    </ToastProvider>
  );

describe('NewResolutionForm (#160)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockIssueResolution.mockResolvedValue({});
  });

  it('renders the form and shows the referenced procedure', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Registro de Resolución y Ejecución' })
    ).toBeInTheDocument();
    expect(screen.getByText('Trámite ID: 3')).toBeInTheDocument();
  });

  it('issues a resolution when a file is attached and the form is submitted', async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Trámite ID: 3')).toBeInTheDocument()
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['x'], 'resolucion.pdf', { type: 'application/pdf' })] },
    });

    const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mockIssueResolution).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroResolucion: 'R-001',
          asunto: 'Asunto de prueba',
          idTramite: 3,
        })
      )
    );
  });

  it('shows an error toast when no file is attached', async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText('Trámite ID: 3')).toBeInTheDocument()
    );

    const submit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    expect(
      (await screen.findAllByText('Error al guardar la resolución')).length
    ).toBeGreaterThan(0);
    expect(mockIssueResolution).not.toHaveBeenCalled();
  });
});
