import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { EvaluationForm } from './EvaluationForm';
import { evaluacionService } from '../../services/evaluacionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    submitResult: vi.fn(),
    submitEvaluationForm: vi.fn(),
    getByEvaluator: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?evaluationId=1&projectTitle=Proyecto+IA', pathname: '/evaluations/1' }),
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockEvaluacionService = vi.mocked(evaluacionService);

describe('EvaluationForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockEvaluacionService.submitResult.mockResolvedValue(undefined as any);
    mockEvaluacionService.submitEvaluationForm.mockResolvedValue(undefined as any);
  });

  it('renders evaluation criteria', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText('Pertinencia')).toBeDefined();
    expect(screen.getByText('Marco teórico')).toBeDefined();
    expect(screen.getByText('Objetivos')).toBeDefined();
    expect(screen.getByText('Viabilidad')).toBeDefined();
    expect(screen.getByText('Impacto')).toBeDefined();
  });

  it('renders score inputs for each criterion', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBe(5);
  });

  it('renders observations textarea', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('renders submit button', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /preparar dictamen/i });
    expect(submitBtn).toBeDefined();
  });

  it('renders save progress button', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const saveBtn = screen.getByRole('button', { name: /guardar avance/i });
    expect(saveBtn).toBeDefined();
  });

  it('renders back link to evaluations', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver a mis evaluaciones/i });
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/evaluations/my-evaluations');
  });

  it('renders page heading', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText('Evaluación de propuesta')).toBeDefined();
  });

  it('shows default verdict as Desaprobado', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getAllByText('Desaprobado').length).toBeGreaterThan(0);
  });

  it('calculates verdict on score change to APROBADO', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '14' } });
      });
    }

    expect(screen.getAllByText('Aprobado').length).toBeGreaterThan(0);
  });

  it('shows DESAPROBADO verdict for low scores', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '1' } });
      });
    }

    expect(screen.getAllByText('Desaprobado').length).toBeGreaterThan(0);
  });

  it('shows total score calculation', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '10' } });
      });
    }

    expect(screen.getByText('10/20')).toBeDefined();
  });

  it('shows progress saved message on save', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const saveBtn = screen.getByRole('button', { name: /guardar avance/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/avance guardado/i)).toBeDefined();
    });
  });

  it('shows validation error when not all criteria scored', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const submitBtn = screen.getByRole('button', { name: /preparar dictamen/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/complete el puntaje de todos los criterios/i)).toBeDefined();
    });
  });

  it('shows validation error when general comments too short', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '10' } });
      });
    }

    const submitBtn = screen.getByRole('button', { name: /preparar dictamen/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/al menos 10 caracteres/i)).toBeDefined();
    });
  });

  it('renders grading rubric table', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText(/rúbrica de calificación/i)).toBeDefined();
  });

  it('renders general verdict section', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText(/dictamen general/i)).toBeDefined();
  });

  it('renders evaluation ID info', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText(/evaluación id/i)).toBeDefined();
  });

  it('renders anonymous notice', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    expect(screen.getByText(/identidad será confidencial/i)).toBeDefined();
  });
});
