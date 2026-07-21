import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NewThesisPlan } from './NewThesisPlan';

const {
  mockGetLines,
  mockGetGroups,
  mockGetMembers,
  mockGetGroupLines,
  mockUpload,
  mockApiPost,
} = vi.hoisted(() => ({
  mockGetLines: vi.fn(),
  mockGetGroups: vi.fn(),
  mockGetMembers: vi.fn(),
  mockGetGroupLines: vi.fn(),
  mockUpload: vi.fn(),
  mockApiPost: vi.fn(),
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: mockGetLines,
    getGroups: mockGetGroups,
    getMembers: mockGetMembers,
    getGroupLines: mockGetGroupLines,
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: { upload: mockUpload },
}));

vi.mock('../../services/api', () => ({
  api: { post: mockApiPost },
}));

const renderPage = (role = 'ESTUDIANTE') =>
  render(
    <AuthContext.Provider
      value={{ currentRole: role, user: { id: 1 }, isAuthenticated: true } as any}
    >
      <MemoryRouter>
        <NewThesisPlan />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('NewThesisPlan (#155)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetLines.mockResolvedValue([{ id: 1, lineName: 'Linea de Prueba', active: true }]);
    mockGetGroups.mockResolvedValue([{ id: 1, groupName: 'Grupo de Prueba' }]);
    mockGetGroupLines.mockResolvedValue([{ id: 1, lineName: 'Linea de Prueba', active: true }]);
    mockGetMembers.mockResolvedValue([]);
    mockUpload.mockResolvedValue({ id: 123, originalName: 'plan.pdf', extension: 'PDF' });
    mockApiPost.mockResolvedValue({});
  });

  it('renders the plan form after catalogs load', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: 'Registrar Plan de Tesis' })
    ).toBeInTheDocument();
    expect(await screen.findByLabelText('Título de la Tesis')).toBeInTheDocument();
  });

  it('shows a validation error and does not submit when the form is incomplete', async () => {
    renderPage();
    await waitFor(() => expect(mockGetGroups).toHaveBeenCalled());

    const submit = screen.getByRole('button', { name: 'Registrar Plan de Tesis' });
    fireEvent.click(submit);

    expect(
      await screen.findByText('El título debe tener al menos 5 caracteres.')
    ).toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('submits a valid plan and calls api.post', async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('Título de la Tesis')).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText('Título de la Tesis'), {
      target: { value: 'Mi tesis de investigacion' },
    });
    fireEvent.change(screen.getByLabelText('Resumen Académico'), {
      target: { value: 'Este es un resumen academico de prueba suficientemente largo' },
    });
    fireEvent.change(screen.getByLabelText('Grupo de Investigación'), {
      target: { value: '1' },
    });

    await waitFor(() => {
      const line = screen.getByLabelText('Línea de Investigación') as HTMLSelectElement;
      expect(line.querySelectorAll('option').length).toBeGreaterThan(1);
    });
    fireEvent.change(screen.getByLabelText('Línea de Investigación'), {
      target: { value: '1' },
    });

    const fileInput = document.getElementById('thesis-plan-file') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['x'], 'plan.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());

    const submit = screen.getByRole('button', { name: 'Registrar Plan de Tesis' });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/thesis/plans',
        expect.objectContaining({
          tituloTesis: 'Mi tesis de investigacion',
          idLinea: 1,
          idGrupo: 1,
          idDocumentoActual: 123,
        })
      )
    );
  });
});
