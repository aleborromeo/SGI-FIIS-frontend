import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { NewProposal } from './NewProposal';
import { projectService } from '../../services/projectService';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/projectService', () => ({
  projectService: {
    create: vi.fn(),
    getMyDrafts: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
    getGroupsByLine: vi.fn(),
  },
}));

vi.mock('../../services/callService', () => ({
  callService: {
    getById: vi.fn(),
    checkPrerequisitos: vi.fn(),
    getVigent: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?callId=1', pathname: '/projects/new' }),
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);
const mockResearchService = vi.mocked(researchService);
const mockCallService = vi.mocked(callService);

const mockLines = [
  { id: 1, lineName: 'Línea de Computación', lineCode: 'L01', active: true },
  { id: 2, lineName: 'Línea de Software', lineCode: 'L02', active: true },
];

const mockGroups = [
  { id: 1, groupName: 'GI-SOFT', groupCode: 'G01', active: true },
];

const mockCalls = [
  { id: 1, title: 'Convocatoria 2026-I', description: '', startDate: '2026-01-01', endDate: '2026-06-30', status: 'ABIERTA', targetAudience: 'DOCENTES', researchLineIds: [] },
];

describe('NewProposal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProjectService.create.mockResolvedValue({ id: 1 } as any);
    mockProjectService.getMyDrafts.mockResolvedValue([]);
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
    mockResearchService.getGroups.mockResolvedValue(mockGroups as any);
    mockResearchService.getGroupsByLine.mockResolvedValue(mockGroups as any);
    mockCallService.getById.mockResolvedValue(mockCalls[0] as any);
    mockCallService.checkPrerequisitos.mockResolvedValue({ valid: true, hasActiveGroup: true, hasVigentCalls: true, docente: true });
    mockCallService.getVigent.mockResolvedValue(mockCalls as any);
  });

  it('shows prerequisites verification loading state', async () => {
    mockCallService.checkPrerequisitos.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ valid: true, hasActiveGroup: true, hasVigentCalls: true, docente: true }), 1000))
    );
    renderWithProviders(<NewProposal />);
    expect(screen.getByText(/verificando prerrequisitos/i)).toBeDefined();
  });

  it('renders form after loading', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/nueva propuesta de proyecto/i)).toBeDefined();
    });
    expect(screen.getByText(/datos generales/i)).toBeDefined();
  });

  it('renders title input', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });
    const titleInput = screen.getByPlaceholderText(/título completo del proyecto/i);
    expect(titleInput).toBeDefined();
  });

  it('renders research line select', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('updates title on input', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });
    const titleInput = screen.getByPlaceholderText(/título completo del proyecto/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi Proyecto de Investigación' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Mi Proyecto de Investigación');
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });
    const submitBtn = screen.getByRole('button', { name: /registrar propuesta/i });
    expect(submitBtn).toBeDefined();
  });

  it('renders back/cancel link to projects', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });
    const cancelLinks = screen.getAllByRole('link');
    const projectsLink = cancelLinks.find(l => l.getAttribute('href') === '/projects');
    expect(projectsLink).toBeDefined();
  });

  it('shows prerequisites error when not valid', async () => {
    mockCallService.checkPrerequisitos.mockResolvedValue({
      valid: false,
      hasActiveGroup: false,
      hasVigentCalls: true,
      docente: true,
    });
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/no habilitado para registrar proyectos/i)).toBeDefined();
    });
    expect(screen.getByText(/grupo de investigación activo/i)).toBeDefined();
  });

  it('calls projectService.create on valid submit', async () => {
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });

    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '1' } });
    });
    await act(async () => {
      fireEvent.change(selects[1], { target: { value: '1' } });
    });

    const titleInput = screen.getByPlaceholderText(/título completo del proyecto/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi Proyecto de Investigación' } });
    });

    const resumenInput = screen.getByPlaceholderText(/breve descripción del proyecto/i);
    await act(async () => {
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen detallado del proyecto de investigación' } });
    });

    const objetivoInput = screen.getByPlaceholderText(/objetivo principal del proyecto/i);
    await act(async () => {
      fireEvent.change(objetivoInput, { target: { value: 'Este es el objetivo general del proyecto de investigación' } });
    });

    const lugarInput = screen.getByPlaceholderText(/laboratorio fiis/i);
    await act(async () => {
      fireEvent.change(lugarInput, { target: { value: 'Laboratorio FIIS - Piso 3' } });
    });

    const presupuestoInput = screen.getByPlaceholderText('0.00');
    await act(async () => {
      fireEvent.change(presupuestoInput, { target: { value: '50000' } });
    });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateStartInputs = screen.getAllByLabelText(/fecha de inicio/i);
    const dateEndInputs = screen.getAllByLabelText(/fecha de fin/i);
    if (dateStartInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateStartInputs[0], { target: { value: '2026-01-01' } });
      });
    }
    if (dateEndInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateEndInputs[0], { target: { value: '2026-12-31' } });
      });
    }

    const submitBtn = screen.getByRole('button', { name: /registrar propuesta/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(mockProjectService.create).toHaveBeenCalled();
    });
  });

  it('shows error message on submit failure', async () => {
    mockProjectService.create.mockRejectedValue(new Error('Error al registrar'));
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });

    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '1' } });
    });
    await act(async () => {
      fireEvent.change(selects[1], { target: { value: '1' } });
    });

    const titleInput = screen.getByPlaceholderText(/título completo del proyecto/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi Proyecto de Investigación' } });
    });

    const resumenInput = screen.getByPlaceholderText(/breve descripción del proyecto/i);
    await act(async () => {
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen detallado del proyecto de investigación' } });
    });

    const objetivoInput = screen.getByPlaceholderText(/objetivo principal del proyecto/i);
    await act(async () => {
      fireEvent.change(objetivoInput, { target: { value: 'Este es el objetivo general del proyecto de investigación' } });
    });

    const lugarInput = screen.getByPlaceholderText(/laboratorio fiis/i);
    await act(async () => {
      fireEvent.change(lugarInput, { target: { value: 'Laboratorio FIIS - Piso 3' } });
    });

    const presupuestoInput = screen.getByPlaceholderText('0.00');
    await act(async () => {
      fireEvent.change(presupuestoInput, { target: { value: '50000' } });
    });

    const dateStartInputs = screen.getAllByLabelText(/fecha de inicio/i);
    const dateEndInputs = screen.getAllByLabelText(/fecha de fin/i);
    if (dateStartInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateStartInputs[0], { target: { value: '2026-01-01' } });
      });
    }
    if (dateEndInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateEndInputs[0], { target: { value: '2026-12-31' } });
      });
    }

    const submitBtn = screen.getByRole('button', { name: /registrar propuesta/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/error al registrar/i)).toBeDefined();
    });
  });

  it('shows member-related error on submit with member error', async () => {
    mockProjectService.create.mockRejectedValue(new Error('No eres miembro del grupo'));
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/datos generales/i)).toBeDefined();
    });

    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: '1' } });
    });
    await act(async () => {
      fireEvent.change(selects[1], { target: { value: '1' } });
    });

    const titleInput = screen.getByPlaceholderText(/título completo del proyecto/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi Proyecto de Investigación' } });
    });

    const resumenInput = screen.getByPlaceholderText(/breve descripción del proyecto/i);
    await act(async () => {
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen detallado del proyecto de investigación' } });
    });

    const objetivoInput = screen.getByPlaceholderText(/objetivo principal del proyecto/i);
    await act(async () => {
      fireEvent.change(objetivoInput, { target: { value: 'Este es el objetivo general del proyecto de investigación' } });
    });

    const lugarInput = screen.getByPlaceholderText(/laboratorio fiis/i);
    await act(async () => {
      fireEvent.change(lugarInput, { target: { value: 'Laboratorio FIIS - Piso 3' } });
    });

    const presupuestoInput = screen.getByPlaceholderText('0.00');
    await act(async () => {
      fireEvent.change(presupuestoInput, { target: { value: '50000' } });
    });

    const dateStartInputs = screen.getAllByLabelText(/fecha de inicio/i);
    const dateEndInputs = screen.getAllByLabelText(/fecha de fin/i);
    if (dateStartInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateStartInputs[0], { target: { value: '2026-01-01' } });
      });
    }
    if (dateEndInputs.length > 0) {
      await act(async () => {
        fireEvent.change(dateEndInputs[0], { target: { value: '2026-12-31' } });
      });
    }

    const submitBtn = screen.getByRole('button', { name: /registrar propuesta/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/miembro activo/i)).toBeDefined();
    });
  });

  it('shows no-calls alert when no vigent calls', async () => {
    mockCallService.getVigent.mockResolvedValue([]);
    renderWithProviders(<NewProposal />);
    await waitFor(() => {
      expect(screen.getByText(/convocatorias no disponibles/i)).toBeDefined();
    });
  });
});
