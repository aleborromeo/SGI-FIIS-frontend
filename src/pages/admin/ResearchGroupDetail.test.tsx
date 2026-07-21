import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ResearchGroupDetail } from './ResearchGroupDetail';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroupById: vi.fn(),
    getMembers: vi.fn(),
    getGroupLines: vi.fn(),
    getLines: vi.fn(),
    getAvailableUsers: vi.fn(),
    getCoordinatorCandidates: vi.fn(),
    assignCoordinator: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    assignGroupToLine: vi.fn(),
    removeGroupFromLine: vi.fn(),
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
    useParams: () => ({ id: '10' }),
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe('ResearchGroupDetail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockResearchService.getGroupById.mockResolvedValue({
      id: 10,
      groupName: 'GI-SOFT',
      groupCode: 'G01',
      active: true,
      currentCoordinatorId: 200,
      createdAt: '2026-01-01T00:00:00Z',
    } as any);

    mockResearchService.getMembers.mockResolvedValue([
      {
        userId: 200,
        userFirstNames: 'Carlos',
        userLastNames: 'Sánchez',
        userEmail: 'carlos@unas.edu.pe',
        userRoleCode: 'INVESTIGADOR_PRINCIPAL',
        joinedAt: '2026-01-01T00:00:00Z',
        active: true,
      },
    ] as any);

    mockResearchService.getGroupLines.mockResolvedValue([
      {
        id: 300,
        lineName: 'Inteligencia Artificial',
        lineCode: 'LI-01',
        active: true,
      },
    ] as any);

    mockResearchService.getLines.mockResolvedValue([
      {
        id: 300,
        lineName: 'Inteligencia Artificial',
        lineCode: 'LI-01',
        active: true,
      },
      {
        id: 301,
        lineName: 'Ciberseguridad',
        lineCode: 'LI-02',
        active: true,
      },
    ] as any);

    mockResearchService.getAvailableUsers.mockResolvedValue([
      {
        id: 201,
        firstNames: 'Ana',
        lastNames: 'Gomez',
        institutionalEmail: 'ana@unas.edu.pe',
      },
    ]);

    mockResearchService.getCoordinatorCandidates.mockResolvedValue([
      {
        id: 202,
        firstNames: 'Maria',
        lastNames: 'López',
        institutionalEmail: 'maria@unas.edu.pe',
      },
    ]);

    mockResearchService.assignCoordinator.mockResolvedValue({} as any);
    mockResearchService.addMember.mockResolvedValue({} as any);
    mockResearchService.removeMember.mockResolvedValue({} as any);
    mockResearchService.assignGroupToLine.mockResolvedValue({} as any);
    mockResearchService.removeGroupFromLine.mockResolvedValue({} as any);
    mockResearchService.deactivateGroup.mockResolvedValue({} as any);
  });

  it('renders details, coordination tab, and back button successfully', async () => {
    renderWithProviders(<ResearchGroupDetail />);

    expect(mockResearchService.getGroupById).toHaveBeenCalledWith(10);

    // Wait for render
    expect(await screen.findByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-SOFT')).toBeDefined();

    // Check breadcrumb
    const backBtn = screen.getByText('Volver a Grupos');
    await act(async () => {
      backBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('handles assigning a coordinator', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    // The coordinator dropdown is the first select on the summary page
    const selectCoord = screen.getAllByRole('combobox')[0];
    expect(selectCoord).toBeDefined();

    await act(async () => {
      fireEvent.change(selectCoord, { target: { value: '202' } }); // select Maria López
    });

    const assignBtn = screen.getByRole('button', { name: 'Guardar' });
    await act(async () => {
      assignBtn.click();
    });

    expect(mockResearchService.assignCoordinator).toHaveBeenCalledWith(10, 202);
  });

  it('handles deactivating the research group', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const deactivateBtn = screen.getByRole('button', { name: 'Desactivar Grupo' });
    expect(deactivateBtn).toBeDefined();

    await act(async () => {
      deactivateBtn.click();
    });

    // Confirm modal opens, verify desvincular confirm btn
    const confirmBtns = await screen.findAllByRole('button', { name: 'Desactivar' });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    expect(modalConfirmBtn).toBeDefined();

    await act(async () => {
      modalConfirmBtn.click();
    });

    expect(mockResearchService.deactivateGroup).toHaveBeenCalledWith(10);
    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('renders members list, allows adding and removing member in members tab', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    // Switch to members tab
    const membersTabBtn = screen.getByRole('button', { name: /Miembros \(/i });
    await act(async () => {
      membersTabBtn.click();
    });

    // Lists members correctly
    expect(screen.getByText('Carlos Sánchez')).toBeDefined();

    // Select available user to add
    const selectMember = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(selectMember, { target: { value: '201' } }); // select Ana Gomez
    });

    const addBtn = screen.getByRole('button', { name: 'Agregar' });
    await act(async () => {
      addBtn.click();
    });

    expect(mockResearchService.addMember).toHaveBeenCalledWith(10, 201);

    // Remove member
    const removeBtn = screen.getByRole('button', { name: 'Retirar' });
    await act(async () => {
      removeBtn.click();
    });

    const confirmBtns = await screen.findAllByRole('button', { name: 'Retirar' });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    await act(async () => {
      modalConfirmBtn.click();
    });

    expect(mockResearchService.removeMember).toHaveBeenCalledWith(10, 200);
  });

  it('renders research lines tab, assigns and removes research line', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    // Switch to lines tab
    const linesTabBtn = screen.getByRole('button', { name: /Líneas \(/i });
    await act(async () => {
      linesTabBtn.click();
    });

    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();

    // Assign line
    const selectLine = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(selectLine, { target: { value: '301' } }); // Ciberseguridad
    });

    const addBtn = screen.getByRole('button', { name: 'Añadir' });
    await act(async () => {
      addBtn.click();
    });

    expect(mockResearchService.assignGroupToLine).toHaveBeenCalledWith(301, 10);

    // Remove line
    const removeBtn = screen.getByRole('button', { name: 'Remover' });
    await act(async () => {
      removeBtn.click();
    });

    const confirmBtns = await screen.findAllByRole('button', { name: 'Remover' });
    const modalConfirmBtn = confirmBtns[confirmBtns.length - 1];
    await act(async () => {
      modalConfirmBtn.click();
    });

    expect(mockResearchService.removeGroupFromLine).toHaveBeenCalledWith(300, 10);
  });
});

