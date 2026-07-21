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
        id: 1,
        userId: 200,
        userFirstNames: 'Carlos',
        userLastNames: 'Sánchez',
        userEmail: 'carlos@unas.edu.pe',
        userRoleCode: 'DOCENTE_INVESTIGADOR',
        memberRole: 'INVESTIGADOR_PRINCIPAL',
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

  it('renders group details after loading', async () => {
    renderWithProviders(<ResearchGroupDetail />);

    expect(mockResearchService.getGroupById).toHaveBeenCalledWith(10);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('G01')).toBeDefined();
  });

  it('renders members list in the members tab', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const membersTabBtn = screen.getByRole('button', { name: /Miembros \(/i });
    await act(async () => {
      fireEvent.click(membersTabBtn);
    });

    expect(screen.getByText('Carlos Sánchez')).toBeDefined();
    expect(screen.getByText('carlos@unas.edu.pe')).toBeDefined();
  });

  it('renders lines list in the lines tab', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const linesTabBtn = screen.getByRole('button', { name: /Líneas \(/i });
    await act(async () => {
      fireEvent.click(linesTabBtn);
    });

    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();
  });

  it('navigates to edit group page', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const editBtn = screen.getByRole('button', { name: /Editar/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/groups/10/edit');
  });

  it('navigates back to groups list', async () => {
    renderWithProviders(<ResearchGroupDetail />);
    expect(await screen.findByText('GI-SOFT')).toBeDefined();

    const backBtn = screen.getByText('Volver a Grupos');
    await act(async () => {
      fireEvent.click(backBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/groups');
  });

  it('shows loading state while fetching data', async () => {
    mockResearchService.getGroupById.mockReturnValue(new Promise(() => {}));
    mockResearchService.getMembers.mockReturnValue(new Promise(() => {}));
    mockResearchService.getGroupLines.mockReturnValue(new Promise(() => {}));
    mockResearchService.getLines.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<ResearchGroupDetail />);

    const spinner = document.querySelector('.animate-fade-in');
    expect(spinner).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    mockResearchService.getGroupById.mockRejectedValue(new Error('Grupo no encontrado'));

    renderWithProviders(<ResearchGroupDetail />);

    expect(await screen.findByText(/Grupo no encontrado/i)).toBeDefined();
  });
});
