import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { EditResearchGroup } from './EditResearchGroup';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroupById: vi.fn(),
    updateGroup: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '10' }),
  };
});

describe('EditResearchGroup page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockResearchService.getGroupById.mockResolvedValue({
      id: 10,
      groupCode: 'GI-ORIGINAL',
      groupName: 'GI Original Name',
    } as any);

    mockResearchService.updateGroup.mockResolvedValue({} as any);
  });

  it('loads and pre-fills form data correctly', async () => {
    renderWithProviders(<EditResearchGroup />);

    // Renders spinner first, then loads
    expect(mockResearchService.getGroupById).toHaveBeenCalledWith(10);

    // Form inputs should contain loaded values
    const codeInput = await screen.findByDisplayValue('GI-ORIGINAL');
    const nameInput = screen.getByDisplayValue('GI Original Name');

    expect(codeInput).toBeDefined();
    expect(nameInput).toBeDefined();
  });

  it('submits updated values and redirects to detail view', async () => {
    renderWithProviders(<EditResearchGroup />);

    const nameInput = await screen.findByDisplayValue('GI Original Name');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grupo' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'GI Updated Name' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(mockResearchService.updateGroup).toHaveBeenCalledWith(10, {
      groupCode: 'GI-ORIGINAL',
      groupName: 'GI Updated Name',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups/10');
  });

  it('displays API error message on update failure', async () => {
    mockResearchService.updateGroup.mockRejectedValue(new Error('Failed to update group'));

    renderWithProviders(<EditResearchGroup />);

    const nameInput = await screen.findByDisplayValue('GI Original Name');
    const submitBtn = screen.getByRole('button', { name: 'Guardar Grupo' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'GI Failed Update' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(screen.getByText(/Failed to update group/i)).toBeDefined();
  });

  it('handles cancellation and back navigation clicks', async () => {
    renderWithProviders(<EditResearchGroup />);
    await screen.findByDisplayValue('GI-ORIGINAL');

    const backBtn = screen.getByText('Volver al detalle');
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups/10');

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await act(async () => {
      cancelBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups/10');
  });
});

