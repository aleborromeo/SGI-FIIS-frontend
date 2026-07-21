import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { ResearchGroupDetail } from './ResearchGroupDetail';
import { researchService } from '../../services/researchService';

const mockGetGroupById = vi.hoisted(() => vi.fn());
const mockGetMembers = vi.hoisted(() => vi.fn());
const mockGetGroupLines = vi.hoisted(() => vi.fn());
const mockGetLines = vi.hoisted(() => vi.fn());
const mockGetAvailableUsers = vi.hoisted(() => vi.fn());
const mockGetCoordinatorCandidates = vi.hoisted(() => vi.fn());
const mockDeactivateGroup = vi.hoisted(() => vi.fn());
const mockAssignCoordinator = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroupById: mockGetGroupById,
    getMembers: mockGetMembers,
    getGroupLines: mockGetGroupLines,
    getLines: mockGetLines,
    getAvailableUsers: mockGetAvailableUsers,
    getCoordinatorCandidates: mockGetCoordinatorCandidates,
    deactivateGroup: mockDeactivateGroup,
    assignCoordinator: mockAssignCoordinator,
    addMember: vi.fn(),
    removeMember: vi.fn(),
    getGroupByUser: vi.fn(),
    assignGroupToLine: vi.fn(),
    removeGroupFromLine: vi.fn(),
  },
}));

const group = {
  id: 1,
  groupCode: 'GI-01',
  groupName: 'Grupo IA',
  active: true,
  currentCoordinatorId: 3,
  coordinatorFirstNames: 'Ana',
  coordinatorLastNames: 'Lopez',
  createdAt: '2024-01-01',
};

const renderPage = () =>
  render(
    <ToastProvider>
      <ConfirmProvider>
        <MemoryRouter initialEntries={['/groups/1']}>
          <Routes>
            <Route path="/groups/:id" element={<ResearchGroupDetail />} />
          </Routes>
        </MemoryRouter>
      </ConfirmProvider>
    </ToastProvider>
  );

describe('ResearchGroupDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGroupById.mockResolvedValue(group);
    mockGetMembers.mockResolvedValue([
      {
        id: 10,
        userId: 2,
        userFirstNames: 'Juan',
        userLastNames: 'Perez',
        userEmail: 'juan@unas.edu.pe',
        active: true,
        joinedAt: '2024-02-01',
      },
    ]);
    mockGetGroupLines.mockResolvedValue([{ id: 7, lineName: 'Linea X', active: true }]);
    mockGetLines.mockResolvedValue([]);
    mockGetAvailableUsers.mockResolvedValue([]);
    mockGetCoordinatorCandidates.mockResolvedValue([]);
  });

  it('renders the group name as heading', async () => {
    renderPage();
    expect(await screen.findByText('Grupo IA')).toBeDefined();
  });

  it('shows members in the members tab', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Miembros/i }));
    expect(await screen.findByText('Juan Perez')).toBeDefined();
  });

  it('deactivates the group after confirming', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('Desactivar Grupo'));

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockDeactivateGroup).toHaveBeenCalledWith(1));
  });
});
