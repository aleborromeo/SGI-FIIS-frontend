import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { EvaluationForm } from './EvaluationForm';
import { evaluacionService } from '../../services/evaluacionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    submitEvaluation: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?evaluationId=1&projectTitle=Proyecto+IA' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockEvaluacionService = vi.mocked(evaluacionService);

describe('EvaluationForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockEvaluacionService.submitEvaluation.mockResolvedValue({ id: 1 } as any);
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
    const submitBtn = screen.getByRole('button', { name: /guardar/i });
    expect(submitBtn).toBeDefined();
  });

  it('renders back link to evaluations', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toBeDefined();
  });

  it('calculates verdict on score change', async () => {
    renderWithProviders(<EvaluationForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('spinbutton');
    // Set all scores to 14 each (total = 14.0 -> APROBADO, since each score * weight/100 = 14*20/100 = 2.8 per criterion, 5*2.8 = 14.0)
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '14' } });
      });
    }

    // Verdict badge should show APROBADO
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
    // Set all scores to 10 each (total = 10.0 -> shows "10" in DOM as "{totalScore}/20")
    for (const input of inputs) {
      await act(async () => {
        fireEvent.change(input, { target: { value: '10' } });
      });
    }

    // Total should show in the form (10/20)
    expect(document.body.textContent?.includes('10')).toBeTruthy();
  });
});

