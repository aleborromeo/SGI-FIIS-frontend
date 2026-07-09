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
    
    expect(screen.getByText('Mis evaluaciones')).toBeDefined();
    expect(screen.getByText(/Consulta los proyectos, tesis o documentos asignados/i)).toBeDefined();
  });

  it('renders the mock evaluation data in the table', async () => {
    vi.mocked(evaluacionService.getByEvaluator).mockResolvedValue([
      { id: 1, tipo: 'Proyecto', title: 'Impacto de la IA en la cadena de suministro', assignedAt: '2023-10-01', deadline: '2023-10-15', status: 'PENDIENTE' },
      { id: 2, tipo: 'Tesis', title: 'Optimización de procesos industriales con IoT', assignedAt: '2023-10-02', deadline: '2023-10-16', status: 'COMPLETADO' }
    ]);
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <MyEvaluations />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
    });
    expect(screen.getByText('Optimización de procesos industriales con IoT')).toBeDefined();
  });

  it('renders the action buttons', async () => {
    vi.mocked(evaluacionService.getByEvaluator).mockResolvedValue([
      { id: 1, tipo: 'Proyecto', title: 'Impacto de la IA en la cadena de suministro', assignedAt: '2023-10-01', deadline: '2023-10-15', status: 'PENDIENTE' }
    ]);
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <MyEvaluations />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('Ver');
      const evalButtons = screen.getAllByText('Evaluar');
      expect(viewButtons.length).toBeGreaterThan(0);
      expect(evalButtons.length).toBeGreaterThan(0);
    });
  });
});
