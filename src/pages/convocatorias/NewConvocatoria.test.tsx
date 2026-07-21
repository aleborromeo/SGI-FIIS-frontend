import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewConvocatoria } from './NewConvocatoria';
import { callService } from '../../services/callService';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/callService', () => ({
  callService: {
    create: vi.fn(),
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
    useLocation: () => ({ key: 'test-key', pathname: '/convocatorias/new', search: '' }),
  };
});

const mockCallService = vi.mocked(callService);
const mockResearchService = vi.mocked(researchService);

const mockLines = [
  { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'LI-01', active: true },
  { id: 2, lineName: 'Ciberseguridad', lineCode: 'LI-02', active: true },
];

describe('NewConvocatoria', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCallService.create.mockResolvedValue({ id: 1 } as any);
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
  });

  it('renders the form heading and page structure', async () => {
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('Nueva Convocatoria')).toBeDefined();
    expect(screen.getByText(/Se registrará y publicará de inmediato/)).toBeDefined();
  });

  it('renders title input field', async () => {
    renderWithProviders(<NewConvocatoria />);
    const titleInput = await screen.findByLabelText(/título/i);
    expect(titleInput).toBeDefined();
    expect((titleInput as HTMLInputElement).value).toBe('');
  });

  it('renders description textarea', async () => {
    renderWithProviders(<NewConvocatoria />);
    const descInput = await screen.findByLabelText(/descripción/i);
    expect(descInput).toBeDefined();
  });

  it('renders date input fields', async () => {
    renderWithProviders(<NewConvocatoria />);
    const startDate = await screen.findByLabelText(/Fecha de Inicio/i);
    const endDate = screen.getByLabelText(/Fecha de Cierre/i);
    expect(startDate).toBeDefined();
    expect(endDate).toBeDefined();
  });

  it('updates title on input change', async () => {
    renderWithProviders(<NewConvocatoria />);
    const titleInput = await screen.findByLabelText(/título/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Convocatoria FIIS 2026' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Convocatoria FIIS 2026');
  });

  it('updates description on input change', async () => {
    renderWithProviders(<NewConvocatoria />);
    const descInput = await screen.findByLabelText(/descripción/i);
    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Descripción de la convocatoria de prueba.' } });
    });
    expect((descInput as HTMLTextAreaElement).value).toBe('Descripción de la convocatoria de prueba.');
  });

  it('renders audience selection options', async () => {
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('Solo Docentes')).toBeDefined();
    expect(screen.getByText('Solo Estudiantes')).toBeDefined();
    expect(screen.getByText('Docentes y Estudiantes')).toBeDefined();
  });

  it('selects audience option', async () => {
    renderWithProviders(<NewConvocatoria />);
    const docentesOption = await screen.findByText('Solo Docentes');
    await act(async () => {
      fireEvent.click(docentesOption.closest('button') || docentesOption);
    });
    expect(docentesOption).toBeDefined();
  });

  it('loads research lines on mount', async () => {
    renderWithProviders(<NewConvocatoria />);
    await act(async () => {});
    expect(mockResearchService.getLines).toHaveBeenCalledWith(true);
  });

  it('renders research lines as selectable chips', async () => {
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('selects and deselects research lines', async () => {
    renderWithProviders(<NewConvocatoria />);
    const iaLine = await screen.findByText('Inteligencia Artificial');

    await act(async () => {
      fireEvent.click(iaLine.closest('button') || iaLine);
    });

    await act(async () => {
      fireEvent.click(iaLine.closest('button') || iaLine);
    });

    expect(iaLine).toBeDefined();
  });

  it('shows no-lines message when getLines returns empty', async () => {
    mockResearchService.getLines.mockResolvedValue([]);
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('No hay líneas disponibles.')).toBeDefined();
  });

  it('shows validation errors when submitting with empty fields', async () => {
    renderWithProviders(<NewConvocatoria />);

    const createBtn = await screen.findByRole('button', { name: /Crear Convocatoria/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    expect(mockCallService.create).not.toHaveBeenCalled();
  });

  it('validates title minimum length on blur', async () => {
    renderWithProviders(<NewConvocatoria />);
    const titleInput = await screen.findByLabelText(/título/i);

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'AB' } });
      fireEvent.blur(titleInput);
    });

    expect(screen.getByText('Mínimo 5 caracteres')).toBeDefined();
  });

  it('validates description minimum length on blur', async () => {
    renderWithProviders(<NewConvocatoria />);
    const descInput = await screen.findByLabelText(/descripción/i);

    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Corto' } });
      fireEvent.blur(descInput);
    });

    expect(screen.getByText('Mínimo 20 caracteres')).toBeDefined();
  });

  it('successful submit calls service and navigates', async () => {
    renderWithProviders(<NewConvocatoria />);

    const titleInput = await screen.findByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const startDate = screen.getByLabelText(/Fecha de Inicio/i);
    const endDate = screen.getByLabelText(/Fecha de Cierre/i);

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Nueva Convocatoria 2026-II' } });
      fireEvent.change(descInput, { target: { value: 'Esta es una descripción válida de la convocatoria con más de 20 caracteres.' } });
      fireEvent.change(startDate, { target: { value: '2026-08-01' } });
      fireEvent.change(endDate, { target: { value: '2026-12-31' } });
    });

    const createBtn = screen.getByRole('button', { name: /Crear Convocatoria/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(mockCallService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Nueva Convocatoria 2026-II',
        description: expect.stringContaining('Esta es una descripción válida'),
        startDate: '2026-08-01',
        endDate: '2026-12-31',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('shows error toast when create fails', async () => {
    mockCallService.create.mockRejectedValue(new Error('Server error'));

    renderWithProviders(<NewConvocatoria />);

    const titleInput = await screen.findByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const startDate = screen.getByLabelText(/Fecha de Inicio/i);
    const endDate = screen.getByLabelText(/Fecha de Cierre/i);

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Convocatoria con Error' } });
      fireEvent.change(descInput, { target: { value: 'Descripción que debería funcionar correctamente para el test.' } });
      fireEvent.change(startDate, { target: { value: '2026-08-01' } });
      fireEvent.change(endDate, { target: { value: '2026-12-31' } });
    });

    const createBtn = screen.getByRole('button', { name: /Crear Convocatoria/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(mockCallService.create).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<NewConvocatoria />);
    const backBtn = await screen.findByRole('button', { name: /Volver a Convocatorias/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('navigates back via cancel button', async () => {
    renderWithProviders(<NewConvocatoria />);
    const cancelBtn = await screen.findByRole('button', { name: /Cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });

  it('disables submit button during loading', async () => {
    let resolveCreate: any;
    mockCallService.create.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; })
    );

    renderWithProviders(<NewConvocatoria />);

    const titleInput = await screen.findByLabelText(/título/i);
    const descInput = screen.getByLabelText(/descripción/i);
    const startDate = screen.getByLabelText(/Fecha de Inicio/i);
    const endDate = screen.getByLabelText(/Fecha de Cierre/i);

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Convocatoria Loading Test' } });
      fireEvent.change(descInput, { target: { value: 'Descripción lo suficientemente larga para pasar la validación.' } });
      fireEvent.change(startDate, { target: { value: '2026-08-01' } });
      fireEvent.change(endDate, { target: { value: '2026-12-31' } });
    });

    const createBtn = screen.getByRole('button', { name: /Crear Convocatoria/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(createBtn.hasAttribute('disabled')).toBe(true);

    resolveCreate({ id: 99 });

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
  });

  it('displays field count indicator', async () => {
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('1/5')).toBeDefined();
  });
});
