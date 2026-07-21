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

  it('renders groups after loading', async () => {
    renderWithProviders(<ResearchGroups />);

    expect(mockResearchService.getGroups).toHaveBeenCalled();
    expect(await screen.findByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-HARD')).toBeDefined();
    expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    expect(screen.getByText('Ana Gomez')).toBeDefined();
  });

  it('shows empty state when no groups exist', async () => {
    mockResearchService.getGroups.mockResolvedValue([]);
    renderWithProviders(<ResearchGroups />);

    expect(await screen.findByText(/No se encontraron grupos/i)).toBeDefined();
  });

  it('filters groups by search term', async () => {
    renderWithProviders(<ResearchGroups />);

    const searchInput = await screen.findByPlaceholderText('Buscar por nombre, código o coordinador...');
    expect(searchInput).toBeDefined();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'HARD' } });
    });

    expect(screen.queryByText('GI-SOFT')).toBeNull();
    expect(screen.getByText('GI-HARD')).toBeDefined();
  });

  it('navigates to create group page', async () => {
    renderWithProviders(<ResearchGroups />);

    const newBtn = await screen.findByRole('button', { name: /Nuevo Grupo/i });
    await act(async () => {
      fireEvent.click(newBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/groups/new');
  });

  it('navigates to edit group detail', async () => {
    const { container } = renderWithProviders(<ResearchGroups />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const viewBtn = container.querySelector('#btn-view-group-1') as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(viewBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/groups/1');
  });

  it('deactivates a group with confirmation', async () => {
    renderWithProviders(<ResearchGroups />);

    const deactivateBtn = await screen.findByRole('button', { name: /Desactivar/i });
    await act(async () => {
      fireEvent.click(deactivateBtn);
    });

    const confirmModalBtns = await screen.findAllByRole('button', { name: /Desactivar/i });
    const modalConfirmBtn = confirmModalBtns[confirmModalBtns.length - 1];
    await act(async () => {
      fireEvent.click(modalConfirmBtn);
    });

    expect(mockResearchService.deactivateGroup).toHaveBeenCalledWith(1);
    expect(mockResearchService.getGroups).toHaveBeenCalledTimes(2);
  });

  it('shows loading state while fetching groups', async () => {
    mockResearchService.getGroups.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ResearchGroups />);

    const spinner = document.querySelector('.animate-fade-in');
    expect(spinner).toBeDefined();
  });
});
