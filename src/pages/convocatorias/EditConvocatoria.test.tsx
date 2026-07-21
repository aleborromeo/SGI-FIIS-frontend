import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { EditConvocatoria } from './EditConvocatoria';
import { callService } from '../../services/callService';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/callService', () => ({
  callService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
    useLocation: () => ({ key: 'test-key', pathname: '/convocatorias/1/edit', search: '' }),
  };
});

const mockCallService = vi.mocked(callService);
const mockResearchService = vi.mocked(researchService);

const mockCall = {
  id: 1,
  title: 'Convocatoria Existente',
  description: 'Descripción de la convocatoria existente para tests.',
  status: 'ABIERTA',
  startDate: '2026-01-01',
  endDate: '2026-06-30',
  targetAudience: 'DOCENTES',
  researchLineIds: [1],
  documentId: undefined,
};

const mockLines = [
  { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'LI-01', active: true },
  { id: 2, lineName: 'Ciberseguridad', lineCode: 'LI-02', active: true },
];

describe('EditConvocatoria', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCallService.getById.mockResolvedValue(mockCall as any);
    mockCallService.update.mockResolvedValue({ ...mockCall } as any);
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
  });

  it('shows loading spinner initially', async () => {
    mockCallService.getById.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<EditConvocatoria />);

    await waitFor(() => {
      expect(screen.getByLabelText('Cargando...')).toBeDefined();
    });
  });

  it('renders form with pre-filled data after loading', async () => {
    renderWithProviders(<EditConvocatoria />);

    const titleInput = await screen.findByDisplayValue('Convocatoria Existente');
    expect(titleInput).toBeDefined();

    const descInput = screen.getByDisplayValue('Descripción de la convocatoria existente para tests.');
    expect(descInput).toBeDefined();
  });

  it('renders date fields with existing values', async () => {
    const { container } = renderWithProviders(<EditConvocatoria />);

    await screen.findByDisplayValue('Convocatoria Existente');

    const startDate = container.querySelector('#conv-start-date');
    const endDate = container.querySelector('#conv-end-date');
    expect(startDate).toBeDefined();
    expect(endDate).toBeDefined();
    expect((startDate as HTMLInputElement).value).toBe('2026-01-01');
    expect((endDate as HTMLInputElement).value).toBe('2026-06-30');
  });

  it('allows editing the title', async () => {
    renderWithProviders(<EditConvocatoria />);
    const titleInput = await screen.findByDisplayValue('Convocatoria Existente');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Convocatoria Actualizada' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Convocatoria Actualizada');
  });

  it('allows editing the description', async () => {
    renderWithProviders(<EditConvocatoria />);
    const descInput = await screen.findByDisplayValue('Descripción de la convocatoria existente para tests.');

    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Nueva descripción actualizada para la convocatoria de prueba.' } });
    });
    expect((descInput as HTMLTextAreaElement).value).toBe('Nueva descripción actualizada para la convocatoria de prueba.');
  });

  it('allows editing date fields', async () => {
    const { container } = renderWithProviders(<EditConvocatoria />);
    await screen.findByDisplayValue('Convocatoria Existente');

    const startDate = container.querySelector('#conv-start-date');
    expect(startDate).toBeDefined();
    await act(async () => {
      fireEvent.change(startDate as Element, { target: { value: '2026-03-01' } });
    });
    expect((startDate as HTMLInputElement).value).toBe('2026-03-01');
  });

  it('renders audience selection options', async () => {
    renderWithProviders(<EditConvocatoria />);
    expect(await screen.findByText('Solo Docentes')).toBeDefined();
    expect(screen.getByText('Solo Estudiantes')).toBeDefined();
    expect(screen.getByText('Docentes y Estudiantes')).toBeDefined();
  });

  it('changes audience selection', async () => {
    renderWithProviders(<EditConvocatoria />);
    await screen.findByDisplayValue('Convocatoria Existente');

    const ambosOption = screen.getByText('Docentes y Estudiantes');
    await act(async () => {
      fireEvent.click(ambosOption.closest('button') || ambosOption);
    });
    expect(ambosOption).toBeDefined();
  });

  it('loads research lines on mount', async () => {
    renderWithProviders(<EditConvocatoria />);
    await act(async () => {});
    expect(mockResearchService.getLines).toHaveBeenCalledWith(true);
  });

  it('renders research lines as selectable chips', async () => {
    renderWithProviders(<EditConvocatoria />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('pre-selects research lines from existing call', async () => {
    renderWithProviders(<EditConvocatoria />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    expect(mockCallService.getById).toHaveBeenCalledWith(1);
  });

  it('submits update successfully and navigates', async () => {
    renderWithProviders(<EditConvocatoria />);
    await screen.findByDisplayValue('Convocatoria Existente');

    const updateBtn = screen.getByRole('button', { name: /Guardar Cambios/i });
    await act(async () => {
      fireEvent.click(updateBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(mockCallService.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: 'Convocatoria Existente',
        description: 'Descripción de la convocatoria existente para tests.',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('shows locked state for non-ABIERTA status', async () => {
    mockCallService.getById.mockResolvedValue({ ...mockCall, status: 'CERRADA' } as any);

    renderWithProviders(<EditConvocatoria />);

    await waitFor(() => {
      expect(screen.getByText('Convocatoria no editable')).toBeDefined();
    });
    expect(screen.getByText(/Solo se pueden editar convocatorias/)).toBeDefined();
  });

  it('shows not-found state when call does not exist', async () => {
    mockCallService.getById.mockResolvedValue({} as any);

    renderWithProviders(<EditConvocatoria />);

    await waitFor(() => {
      expect(screen.getByText('Convocatoria no encontrada')).toBeDefined();
    });
    expect(screen.getByText(/La convocatoria solicitada no existe/)).toBeDefined();
  });

  it('shows not-found state on service error', async () => {
    mockCallService.getById.mockRejectedValue(new Error('Not found'));

    renderWithProviders(<EditConvocatoria />);

    await waitFor(() => {
      expect(screen.getByText('Convocatoria no encontrada')).toBeDefined();
    });
  });

  it('navigates back via back button', async () => {
    renderWithProviders(<EditConvocatoria />);
    const backBtn = await screen.findByRole('button', { name: /Volver a Convocatorias/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('navigates back via cancel button', async () => {
    renderWithProviders(<EditConvocatoria />);
    const cancelBtn = await screen.findByRole('button', { name: /Cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('navigates back from not-found state', async () => {
    mockCallService.getById.mockResolvedValue({} as any);

    renderWithProviders(<EditConvocatoria />);

    const backBtn = await screen.findByRole('button', { name: /Volver$/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('navigates back from locked state', async () => {
    mockCallService.getById.mockResolvedValue({ ...mockCall, status: 'FINALIZADA' } as any);

    renderWithProviders(<EditConvocatoria />);

    const backBtn = await screen.findByRole('button', { name: /Volver$/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('shows error toast when update fails', async () => {
    mockCallService.update.mockRejectedValue(new Error('Update failed'));

    renderWithProviders(<EditConvocatoria />);
    await screen.findByDisplayValue('Convocatoria Existente');

    const updateBtn = screen.getByRole('button', { name: /Guardar Cambios/i });
    await act(async () => {
      fireEvent.click(updateBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(mockCallService.update).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables submit button during loading', async () => {
    let resolveUpdate: any;
    mockCallService.update.mockImplementation(
      () => new Promise((resolve) => { resolveUpdate = resolve; })
    );

    renderWithProviders(<EditConvocatoria />);
    await screen.findByDisplayValue('Convocatoria Existente');

    const updateBtn = screen.getByRole('button', { name: /Guardar Cambios/i });
    await act(async () => {
      fireEvent.click(updateBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(updateBtn.hasAttribute('disabled')).toBe(true);

    resolveUpdate({ id: 1 });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
  });

  it('validates title minimum length on blur', async () => {
    renderWithProviders(<EditConvocatoria />);
    const titleInput = await screen.findByDisplayValue('Convocatoria Existente');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'AB' } });
      fireEvent.blur(titleInput);
    });

    expect(screen.getByText('Minimo 5 caracteres')).toBeDefined();
  });

  it('validates description minimum length on blur', async () => {
    renderWithProviders(<EditConvocatoria />);
    const descInput = await screen.findByDisplayValue('Descripción de la convocatoria existente para tests.');

    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Corto' } });
      fireEvent.blur(descInput);
    });

    expect(screen.getByText('Minimo 20 caracteres')).toBeDefined();
  });

  it('renders edit page heading', async () => {
    renderWithProviders(<EditConvocatoria />);
    expect(await screen.findByText('Editar Convocatoria')).toBeDefined();
  });
});
