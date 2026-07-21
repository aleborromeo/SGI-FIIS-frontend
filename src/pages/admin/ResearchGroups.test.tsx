import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { ResearchGroups } from './ResearchGroups';
import { researchService } from '../../services/researchService';

const mockGetGroups = vi.hoisted(() => vi.fn());
const mockDeactivateGroup = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getGroups: mockGetGroups,
    deactivateGroup: mockDeactivateGroup,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <ConfirmProvider>
        <MemoryRouter>
          <ResearchGroups />
        </MemoryRouter>
      </ConfirmProvider>
    </ToastProvider>
  );

describe('ResearchGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGroups.mockResolvedValue([]);
  });

  it('renders the page title', async () => {
    renderPage();
    expect(await screen.findByText('Grupos de Investigación')).toBeDefined();
  });

  it('lists groups returned by the service', async () => {
    mockGetGroups.mockResolvedValue([
      { id: 1, groupCode: 'GI-01', groupName: 'Grupo IA', active: true, createdAt: '2024-01-01' },
      { id: 2, groupCode: 'GI-02', groupName: 'Grupo Redes', active: false },
    ]);
    renderPage();

    expect(await screen.findByText('Grupo IA')).toBeDefined();
    expect(screen.getByText('Grupo Redes')).toBeDefined();
  });

  it('deactivates a group after confirming', async () => {
    mockGetGroups.mockResolvedValue([
      { id: 1, groupCode: 'GI-01', groupName: 'Grupo IA', active: true },
    ]);
    renderPage();

    await screen.findByText('Grupo IA');
    fireEvent.click(document.getElementById('btn-deactivate-group-1')!);

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockDeactivateGroup).toHaveBeenCalledWith(1));
  });
});
