import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvaluationForm } from './EvaluationForm';
import { ToastProvider } from '../../context/ToastContext';

const { mockSubmitResult } = vi.hoisted(() => ({ mockSubmitResult: vi.fn() }));

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    submitResult: mockSubmitResult,
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/evaluations/evaluar?evaluationId=1']}>
      <ToastProvider>
        <EvaluationForm />
      </ToastProvider>
    </MemoryRouter>
  );

const fillAllCriteria = () => {
  const scoreInputs = screen.getAllByPlaceholderText('0 - 20');
  expect(scoreInputs).toHaveLength(5);
  scoreInputs.forEach((input) => fireEvent.change(input, { target: { value: '20' } }));
  fireEvent.change(screen.getByLabelText(/Observaciones generales/i), {
    target: { value: 'El proyecto cumple con todos los criterios evaluados.' },
  });
};

describe('EvaluationForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSubmitResult.mockResolvedValue({});
    localStorage.clear();
  });

  it('renders the page title and the referential verdict for an empty form', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /Evaluaci/i })
    ).toBeDefined();
    expect(screen.getAllByText('Desaprobado').length).toBeGreaterThan(0);
  });

  it('shows a validation error when submitting with incomplete criteria', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Preparar dictamen/i }));

    expect(
      await screen.findByText(/Complete el puntaje de todos los criterios/i)
    ).toBeDefined();
    expect(mockSubmitResult).not.toHaveBeenCalled();
  });

  it('submits the evaluation result when all criteria are scored', async () => {
    renderPage();
    fillAllCriteria();

    fireEvent.click(screen.getByRole('button', { name: /Preparar dictamen/i }));

    await waitFor(() => expect(mockSubmitResult).toHaveBeenCalled());
    expect(mockSubmitResult).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        resultado: 'APROBADO',
        puntaje: 20,
        observaciones: 'El proyecto cumple con todos los criterios evaluados.',
      })
    );
  });
});
