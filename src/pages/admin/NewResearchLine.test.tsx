import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewResearchLine } from './NewResearchLine';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    createLine: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NewResearchLine page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResearchService.createLine.mockResolvedValue({} as any);
  });

  it('renders form and handles cancellation/back navigation', async () => {
    renderWithProviders(<NewResearchLine />);

    expect(screen.getByText('Nueva Línea de Investigación')).toBeDefined();

    // Back button
    const backBtn = screen.getByText('Volver a Líneas');
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lines');

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await act(async () => {
      cancelBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lines');
  });

  it('submits form successfully and redirects to lines list', async () => {
    renderWithProviders(<NewResearchLine />);

    const nameInput = screen.getByPlaceholderText('Ej: Inteligencia Artificial');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Línea' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Computación en la Nube' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(mockResearchService.createLine).toHaveBeenCalledWith({
      lineName: 'Computación en la Nube',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lines');
  });

  it('displays API error message on creation failure', async () => {
    mockResearchService.createLine.mockRejectedValue(new Error('Failed to create line'));

    renderWithProviders(<NewResearchLine />);

    const nameInput = screen.getByPlaceholderText('Ej: Inteligencia Artificial');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Línea' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Línea Fallida' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText(/Failed to create line/i)).toBeDefined();
  });
});

