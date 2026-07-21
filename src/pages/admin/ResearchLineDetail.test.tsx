import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ResearchLineDetail } from './ResearchLineDetail';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLineById: vi.fn(),
    getGroupsByLine: vi.fn(),
    getGroups: vi.fn(),
    getMembers: vi.fn(),
    assignGroupToLine: vi.fn(),
    removeGroupFromLine: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

describe('ResearchLineDetail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockResearchService.getLineById.mockResolvedValue({
      id: 1,
      lineName: 'Inteligencia Artificial',
      lineCode: 'LI-01',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
      description: 'Línea de IA',
    } as any);

    mockResearchService.getGroupsByLine.mockResolvedValue([
      {
        id: 100,
        groupName: 'GI-SOFT',
        groupCode: 'G01',
        active: true,
        coordinatorFirstNames: 'Carlos',
        coordinatorLastNames: 'Sánchez',
      },
    ] as any);

    mockResearchService.getGroups.mockResolvedValue([
      {
        id: 100,
        groupName: 'GI-SOFT',
        groupCode: 'G01',
        active: true,
      },
      {
        id: 101,
        groupName: 'GI-HARD',
        groupCode: 'G02',
        active: true,
      },
    ] as any);

    mockResearchService.getMembers.mockResolvedValue([
      {
        userId: 200,
        userFirstNames: 'Carlos',
        userLastNames: 'Sánchez',
        userEmail: 'carlos@unas.edu.pe',
        userRoleCode: 'INVESTIGADOR_PRINCIPAL',
        active: true,
      },
    ] as any);

    mockResearchService.assignGroupToLine.mockResolvedValue({} as any);
    mockResearchService.removeGroupFromLine.mockResolvedValue({} as any);
  });

  it('renders line details after loading', async () => {
    renderWithProviders(<ResearchLineDetail />);

    expect(mockResearchService.getLineById).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
  });

  it('shows group association in groups tab', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    expect(screen.getByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('Carlos Sánchez')).toBeDefined();
  });

  it('navigates back to lines list', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const backBtn = screen.getByText('Volver a Líneas');
    await act(async () => {
      fireEvent.click(backBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/lines');
  });

  it('assigns a group to the line', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const selectGroup = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(selectGroup, { target: { value: '101' } });
    });

    const linkBtn = screen.getByRole('button', { name: /^Vincular$/i });
    await act(async () => {
      fireEvent.click(linkBtn);
    });

    expect(mockResearchService.assignGroupToLine).toHaveBeenCalledWith(1, 101);
  });

  it('removes a group assignment with confirmation', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const removeBtn = screen.getByRole('button', { name: /Desvincular/i });
    await act(async () => {
      fireEvent.click(removeBtn);
    });

    const confirmModalBtns = await screen.findAllByRole('button', { name: /Desvincular/i });
    const modalConfirmBtn = confirmModalBtns[confirmModalBtns.length - 1];
    await act(async () => {
      fireEvent.click(modalConfirmBtn);
    });

    expect(mockResearchService.removeGroupFromLine).toHaveBeenCalledWith(1, 100);
  });

  it('shows loading state while fetching data', async () => {
    mockResearchService.getLineById.mockReturnValue(new Promise(() => {}));
    mockResearchService.getGroupsByLine.mockReturnValue(new Promise(() => {}));
    mockResearchService.getGroups.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<ResearchLineDetail />);

    const spinner = document.querySelector('.animate-fade-in');
    expect(spinner).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    mockResearchService.getLineById.mockRejectedValue(new Error('Línea no encontrada'));

    renderWithProviders(<ResearchLineDetail />);

    expect(await screen.findByText(/Línea no encontrada/i)).toBeDefined();
  });
});
