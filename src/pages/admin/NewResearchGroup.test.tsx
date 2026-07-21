import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewResearchGroup } from './NewResearchGroup';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    createGroup: vi.fn(),
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

describe('NewResearchGroup page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResearchService.createGroup.mockResolvedValue({} as any);
  });

  it('renders form and handles cancellation/back navigation', async () => {
    renderWithProviders(<NewResearchGroup />);

    expect(screen.getByText('Nuevo Grupo de Investigación')).toBeDefined();
    
    // Back navigation button
    const backBtn = screen.getByText('Volver a Grupos');
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups');

    // Cancel button
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await act(async () => {
      cancelBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('submits form successfully and redirects to groups list', async () => {
    renderWithProviders(<NewResearchGroup />);

    const codeInput = screen.getByPlaceholderText('Ej: GI-01');
    const nameInput = screen.getByPlaceholderText('Ej: Grupo de Inteligencia Artificial');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grupo' });

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: 'GI-TEST' } });
      fireEvent.change(nameInput, { target: { value: 'GI de Pruebas' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(mockResearchService.createGroup).toHaveBeenCalledWith({
      groupCode: 'GI-TEST',
      groupName: 'GI de Pruebas',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('displays API error message on creation failure', async () => {
    mockResearchService.createGroup.mockRejectedValue(new Error('Code already exists'));

    renderWithProviders(<NewResearchGroup />);

    const codeInput = screen.getByPlaceholderText('Ej: GI-01');
    const nameInput = screen.getByPlaceholderText('Ej: Grupo de Inteligencia Artificial');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grupo' });

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: 'GI-DUPLICATE' } });
      fireEvent.change(nameInput, { target: { value: 'Grupo Duplicado' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText(/Code already exists/i)).toBeDefined();
  });
});

