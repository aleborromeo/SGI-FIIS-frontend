import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { ResearchLines } from './ResearchLines';
import { researchService } from '../../services/researchService';

const mockGetLines = vi.hoisted(() => vi.fn());
const mockChangeLineStatus = vi.hoisted(() => vi.fn());
const mockUpdateLine = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: mockGetLines,
    changeLineStatus: mockChangeLineStatus,
    updateLine: mockUpdateLine,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <ConfirmProvider>
        <MemoryRouter>
          <ResearchLines />
        </MemoryRouter>
      </ConfirmProvider>
    </ToastProvider>
  );

describe('ResearchLines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLines.mockResolvedValue([]);
  });

  it('renders the page title', async () => {
    renderPage();
    expect(await screen.findByText('Líneas de Investigación')).toBeDefined();
  });

  it('lists lines returned by the service', async () => {
    mockGetLines.mockResolvedValue([
      { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'IA', active: true },
      { id: 2, lineName: 'Redes', active: false },
    ]);
    renderPage();

    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Redes')).toBeDefined();
  });

  it('toggles a line status after confirming', async () => {
    mockGetLines.mockResolvedValue([
      { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'IA', active: true },
    ]);
    renderPage();

    await screen.findByText('Inteligencia Artificial');
    fireEvent.click(document.getElementById('btn-toggle-line-1')!);

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockChangeLineStatus).toHaveBeenCalledWith(1, false));
  });
});
