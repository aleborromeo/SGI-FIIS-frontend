import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyEvaluations } from './MyEvaluations';
import { AuthContext } from '../../context/AuthContext';
import { evaluacionService } from '../../services/evaluacionService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    getByEvaluator: vi.fn(),
  }
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('MyEvaluations', () => {
  const mockAuthContext = {
    user: { id: 1, firstNames: 'John' },
    currentRole: 'EVALUADOR',
    token: 'token',
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the title and description correctly', async () => {
    vi.mocked(evaluacionService.getByEvaluator).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <MyEvaluations />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Bandeja de Evaluaciones')).toBeDefined();
    expect(screen.getByText(/Expedientes asignados para evaluación/i)).toBeDefined();
    await waitFor(() => {
      expect(evaluacionService.getByEvaluator).toHaveBeenCalled();
    });
  });

  it('renders the mock evaluation data in the table', async () => {
    vi.mocked(evaluacionService.getByEvaluator).mockResolvedValue([
      { id: 1, expedienteCode: 'EXP-2024-001', tipo: 'Proyecto', convocatoria: 'Convocatoria 2024', assignDate: '2023-10-01', deadline: '2023-10-15', status: 'PENDIENTE' },
      { id: 2, expedienteCode: 'EXP-2024-002', tipo: 'Tesis', convocatoria: 'Convocatoria 2024-B', assignDate: '2023-10-02', deadline: '2023-10-16', status: 'COMPLETADO' }
    ]);
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <MyEvaluations />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('EXP-2024-001')).toBeDefined();
    });
    expect(screen.getByText('EXP-2024-002')).toBeDefined();
    expect(screen.getByText('Convocatoria 2024')).toBeDefined();
  });

  it('renders the action buttons', async () => {
    vi.mocked(evaluacionService.getByEvaluator).mockResolvedValue([
      { id: 1, expedienteCode: 'EXP-2024-001', tipo: 'Proyecto', assignDate: '2023-10-01', deadline: '2023-10-15', status: 'PENDIENTE' }
    ]);
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <MyEvaluations />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Evaluar/)).toBeDefined();
    });
  });
});
