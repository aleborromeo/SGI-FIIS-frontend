import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MyEvaluations } from './MyEvaluations';

// Mock useNavigate if needed, though MemoryRouter handles basic routing context
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('MyEvaluations', () => {
  it('renders the title and description correctly', () => {
    render(
      <MemoryRouter>
        <MyEvaluations />
      </MemoryRouter>
    );
    expect(screen.getByText('Mis Evaluaciones Pendientes')).toBeDefined();
    expect(screen.getByText(/Proyectos y tesis asignados/i)).toBeDefined();
  });

  it('renders the mock evaluation data in the table', () => {
    render(
      <MemoryRouter>
        <MyEvaluations />
      </MemoryRouter>
    );
    // Titles of the mock data
    expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
    expect(screen.getByText('Optimización de procesos industriales con IoT')).toBeDefined();
  });

  it('renders the action buttons', () => {
    render(
      <MemoryRouter>
        <MyEvaluations />
      </MemoryRouter>
    );
    // Ver and Evaluar buttons should exist (multiple since there are multiple rows)
    const viewButtons = screen.getAllByText('Ver');
    const evalButtons = screen.getAllByText('Evaluar');
    
    expect(viewButtons.length).toBeGreaterThan(0);
    expect(evalButtons.length).toBeGreaterThan(0);
  });
});
