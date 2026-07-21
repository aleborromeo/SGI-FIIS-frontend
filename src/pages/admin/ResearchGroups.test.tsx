import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ResearchGroups } from './ResearchGroups';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroups: vi.fn(),
    deactivateGroup: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ key: 'test-key' }),
  };
});

describe('ResearchGroups page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockResearchService.getGroups.mockResolvedValue([
      {
        id: 1,
        groupName: 'GI-SOFT',
        groupCode: 'G01',
        currentCoordinatorId: 100,
        coordinatorFirstNames: 'Carlos',
        coordinatorLastNames: 'Sánchez',
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        groupName: 'GI-HARD',
        groupCode: 'G02',
        currentCoordinatorId: 101,
        coordinatorFirstNames: 'Ana',
        coordinatorLastNames: 'Gomez',
        active: false,
        createdAt: '2026-01-02T00:00:00Z',
      },
    ] as any);

    mockResearchService.deactivateGroup.mockResolvedValue({} as any);
  });

  it('renders research groups list and table correctly', async () => {
    renderWithProviders(<ResearchGroups />);

    expect(mockResearchService.getGroups).toHaveBeenCalled();

    // Wait for row renders
    expect(await screen.findByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-HARD')).toBeDefined();

    expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    expect(screen.getByText('Ana Gomez')).toBeDefined();
  });

  it('handles search input filtering', async () => {
    renderWithProviders(<ResearchGroups />);

    const searchInput = await screen.findByPlaceholderText('Buscar por nombre, código o coordinador...');
    expect(searchInput).toBeDefined();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'HARD' } });
    });

    // GI-SOFT should be filtered out, GI-HARD should remain
    expect(screen.queryByText('GI-SOFT')).toBeNull();
    expect(screen.getByText('GI-HARD')).toBeDefined();
  });

  it('handles status dropdown filtering', async () => {
    renderWithProviders(<ResearchGroups />);

    // Target the select element
    const statusSelect = await screen.findByRole('combobox');
    expect(statusSelect).toBeDefined();

    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'active' } });
    });

    // Only active groups should show (GI-SOFT is active, GI-HARD is inactive)
    expect(screen.getByText('GI-SOFT')).toBeDefined();
    expect(screen.queryByText('GI-HARD')).toBeNull();
  });

  it('handles sorting columns click', async () => {
    renderWithProviders(<ResearchGroups />);

    // Find the header table cell for "Nombre" (index key matches name)
    const nameHeader = await screen.findByText('Nombre');
    expect(nameHeader).toBeDefined();

    await act(async () => {
      nameHeader.click();
    });

    // Clicking it should sort or change direction. We can verify no crash.
    expect(screen.getByText('GI-SOFT')).toBeDefined();
  });

  it('opens confirmation modal and deactivates group', async () => {
    renderWithProviders(<ResearchGroups />);

    // Locate "Desactivar" button next to GI-SOFT (it has active = true)
    // The button text is "Desactivar"
    const deactivateBtn = await screen.findByRole('button', { name: 'Desactivar' });
    expect(deactivateBtn).toBeDefined();

    await act(async () => {
      deactivateBtn.click();
    });

    // Modal opens, confirm button has text "Desactivar"
    // Since there are multiple buttons with text "Desactivar" (row btn and modal btn),
    // get index [1] to fetch the modal confirm button.
    const confirmModalBtn = await screen.findAllByRole('button', { name: 'Desactivar' });
    expect(confirmModalBtn[1]).toBeDefined();

    await act(async () => {
      confirmModalBtn[1].click();
    });

    expect(mockResearchService.deactivateGroup).toHaveBeenCalledWith(1);
    expect(mockResearchService.getGroups).toHaveBeenCalledTimes(2); // re-fetch after deactivation
  });

  it('navigates to create group page on New button click', async () => {
    renderWithProviders(<ResearchGroups />);

    const newBtn = await screen.findByRole('button', { name: 'Nuevo Grupo' });
    expect(newBtn).toBeDefined();

    await act(async () => {
      newBtn.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/groups/new');
  });
});

