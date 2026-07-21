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
        membershipStatus: 'ACTIVE',
        active: true,
      },
    ] as any);

    mockResearchService.assignGroupToLine.mockResolvedValue({} as any);
    mockResearchService.removeGroupFromLine.mockResolvedValue({} as any);
  });

  it('loads and renders details, assigned groups list, and back navigation', async () => {
    renderWithProviders(<ResearchLineDetail />);

    expect(mockResearchService.getLineById).toHaveBeenCalledWith(1);
    expect(mockResearchService.getGroupsByLine).toHaveBeenCalledWith(1);

    // Wait for render
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('GI-SOFT')).toBeDefined();

    // Click back button
    const backBtn = screen.getByText('Volver a Líneas');
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lines');
  });

  it('handles assigning a group to the line', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    // Find select dropdown
    const selectGroup = screen.getByRole('combobox');
    expect(selectGroup).toBeDefined();

    await act(async () => {
      fireEvent.change(selectGroup, { target: { value: '101' } }); // select GI-HARD
    });

    const assignBtn = screen.getByRole('button', { name: 'Vincular' });
    await act(async () => {
      assignBtn.click();
    });

    expect(mockResearchService.assignGroupToLine).toHaveBeenCalledWith(1, 101);
  });

  it('handles removing group assignment from the line', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const removeBtn = screen.getByRole('button', { name: 'Desvincular' });
    expect(removeBtn).toBeDefined();

    await act(async () => {
      removeBtn.click();
    });

    // Confirm modal opens, verify desvincular confirm btn
    const confirmBtns = await screen.findAllByRole('button', { name: 'Desvincular' });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    expect(modalConfirmBtn).toBeDefined();

    await act(async () => {
      modalConfirmBtn.click();
    });

    expect(mockResearchService.removeGroupFromLine).toHaveBeenCalledWith(1, 100);
  });

  it('renders unique group members in users tab', async () => {
    renderWithProviders(<ResearchLineDetail />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const usersTabBtn = screen.getByText(/Usuarios Vinculados/i);
    expect(usersTabBtn).toBeDefined();

    await act(async () => {
      usersTabBtn.click();
    });

    // Verify member details are displayed
    expect(mockResearchService.getMembers).toHaveBeenCalledWith(100);
    expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    expect(screen.getByText('carlos@unas.edu.pe')).toBeDefined();
  });
});

