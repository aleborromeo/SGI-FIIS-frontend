import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewProposalForm } from './NewProposalForm';
import { AuthContext } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { researchService } from '../../../services/researchService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../../../context/ConfirmContext', () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../services/projectService', () => ({
  projectService: {
    create: vi.fn(),
    uploadDocument: vi.fn(),
  },
}));

vi.mock('../../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
    getGroupLines: vi.fn(),
    getMembers: vi.fn(),
  },
}));

vi.mock('../hooks/useEligibility', () => ({
  useEligibility: () => ({
    data: { hasActiveGroup: true, hasVigentCalls: true, docente: true, valid: true },
    isLoading: false,
  }),
}));

vi.mock('../hooks/useConvocatorias', () => ({
  useConvocatorias: () => ({
    data: [{ id: 1, title: 'Convocatoria Test 2026', status: 'ABIERTA', startDate: '2026-01-01', endDate: '2026-12-31', researchLineIds: [1, 2] }],
    isLoading: false,
  }),
}));

const mockAuthContext = {
  user: { id: 1, firstNames: 'Juan', lastNames: 'Pérez', email: 'juan@test.com', researchGroupId: 5 },
  currentRole: 'DOCENTE_INVESTIGADOR',
  token: 'token',
  login: vi.fn(),
  logout: vi.fn(),
  switchRole: vi.fn(),
} as any;

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <NewProposalForm />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('NewProposalForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(researchService.getGroups).mockResolvedValue([
      { id: 5, groupName: 'GINSOFT', groupCode: 'GINSOFT' },
    ]);
    vi.mocked(researchService.getLines).mockResolvedValue([
      { id: 1, lineName: 'Computación', groupId: 5 },
      { id: 2, lineName: 'Redes', groupId: 5 },
    ]);
    vi.mocked(researchService.getGroupLines).mockResolvedValue([
      { id: 1, lineName: 'Computación' },
      { id: 2, lineName: 'Redes' },
    ]);
  });

  it('shows loading state while catalogs load', () => {
    vi.mocked(researchService.getGroups).mockReturnValue(new Promise(() => {}));
    vi.mocked(researchService.getLines).mockReturnValue(new Promise(() => {}));
    renderForm();
    expect(screen.getByText('Cargando datos del formulario...')).toBeDefined();
  });

  it('renders the form title after loading', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Postular Proyecto de Investigación')).toBeDefined();
    });
    expect(screen.getByText(/Completa los pasos/)).toBeDefined();
  });

  it('renders step navigation buttons after loading', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeDefined();
    });
  });

  it('renders save draft button after loading', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText(/Guardar Borrador/)).toBeDefined();
    });
  });

  it('renders cancel button after loading', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeDefined();
    });
  });

  it('blocks navigation when fields are empty', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() => {
      expect(screen.getByText('Postular Proyecto de Investigación')).toBeDefined();
    });
  });

  it('shows GINSOFT restriction when GINSOFT group is selected', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeDefined();
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.mouseDown(selects[1]);

    await waitFor(() => {
      const ginsoftOption = screen.getByText('GINSOFT');
      fireEvent.click(ginsoftOption);
    });

    await waitFor(() => {
      expect(screen.getByText(/Grupo GINSOFT detectado/)).toBeDefined();
    });
  });

  it('renders the ConvocatoriaSelect component', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeDefined();
    });

    expect(screen.getByText('Postular Proyecto de Investigación')).toBeDefined();
  });

  it('does not show GINSOFT restriction for non-GINSOFT groups', async () => {
    vi.mocked(researchService.getGroups).mockResolvedValue([
      { id: 6, groupName: 'Grupo Normal', groupCode: 'GRUPO01' },
    ]);
    vi.mocked(researchService.getGroupLines).mockResolvedValue([
      { id: 1, lineName: 'Línea General' },
    ]);

    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Siguiente')).toBeDefined();
    });

    expect(screen.queryByText(/Grupo GINSOFT detectado/)).toBeNull();
  });
});
