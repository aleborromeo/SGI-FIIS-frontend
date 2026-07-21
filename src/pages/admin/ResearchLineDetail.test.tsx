import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { ResearchLineDetail } from './ResearchLineDetail';
import { researchService } from '../../services/researchService';

const mockGetLineById = vi.hoisted(() => vi.fn());
const mockGetGroupsByLine = vi.hoisted(() => vi.fn());
const mockGetGroups = vi.hoisted(() => vi.fn());
const mockGetMembers = vi.hoisted(() => vi.fn());
const mockAssignGroupToLine = vi.hoisted(() => vi.fn());
const mockRemoveGroupFromLine = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLineById: mockGetLineById,
    getGroupsByLine: mockGetGroupsByLine,
    getGroups: mockGetGroups,
    getMembers: mockGetMembers,
    assignGroupToLine: mockAssignGroupToLine,
    removeGroupFromLine: mockRemoveGroupFromLine,
  },
}));

const line = { id: 1, lineName: 'Inteligencia Artificial', active: true };
const assignedGroup = {
  id: 2,
  groupCode: 'GI-02',
  groupName: 'Grupo Redes',
  active: true,
  coordinatorFirstNames: 'Ana',
  coordinatorLastNames: 'Lopez',
};
const unassignedGroup = { id: 3, groupCode: 'GI-03', groupName: 'Grupo DATA', active: true };

const renderPage = () =>
  render(
    <ToastProvider>
      <ConfirmProvider>
        <MemoryRouter initialEntries={['/lines/1']}>
          <Routes>
            <Route path="/lines/:id" element={<ResearchLineDetail />} />
          </Routes>
        </MemoryRouter>
      </ConfirmProvider>
    </ToastProvider>
  );

describe('ResearchLineDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLineById.mockResolvedValue(line);
    mockGetGroupsByLine.mockResolvedValue([assignedGroup]);
    mockGetGroups.mockResolvedValue([assignedGroup, unassignedGroup]);
    mockGetMembers.mockResolvedValue([
      {
        userId: 5,
        userFirstNames: 'Juan',
        userLastNames: 'Perez',
        userEmail: 'juan@unas.edu.pe',
        userRoleCode: 'DOCENTE_INVESTIGADOR',
        joinedAt: '2024-01-01',
        active: true,
      },
    ]);
  });

  it('renders the line name as heading', async () => {
    renderPage();
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
  });

  it('lists the groups associated with the line', async () => {
    renderPage();
    expect(await screen.findByText('Grupo Redes')).toBeDefined();
  });

  it('links an available group after selecting it', async () => {
    renderPage();
    await screen.findByText('Grupo Redes');

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '3' } });

    fireEvent.click(screen.getByText('Vincular'));

    await waitFor(() => expect(mockAssignGroupToLine).toHaveBeenCalledWith(1, 3));
  });

  it('unlinks a group after confirming', async () => {
    renderPage();
    await screen.findByText('Grupo Redes');

    fireEvent.click(screen.getByText('Desvincular'));

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockRemoveGroupFromLine).toHaveBeenCalledWith(1, 2));
  });

  it('shows linked users in the users tab', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Usuarios/i }));

    expect(await screen.findByText('Juan Perez')).toBeDefined();
  });
});
