import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { callService } from '../../services/callService';
import type { CallResponse } from '../../services/callService';
import ConvocatoriasList from './ConvocatoriasList';

vi.mock('../../services/callService', () => ({
  callService: {
    getAll: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const mockCallService = vi.mocked(callService);

const calls: CallResponse[] = [
  { id: 1, title: 'Convocatoria Alpha', description: 'Desc A', status: 'ABIERTA', startDate: '2026-01-01', endDate: '2026-12-31', researchLineIds: [1] },
  { id: 2, title: 'Convocatoria Beta', description: 'Desc B', status: 'CERRADA', startDate: '2026-01-01', endDate: '2026-06-30', researchLineIds: [] },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ConfirmProvider>
          <ConvocatoriasList />
        </ConfirmProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('ConvocatoriasList', () => {
  beforeEach(() => vi.resetAllMocks());

  it('muestra estado de carga y luego las convocatorias', async () => {
    mockCallService.getAll.mockResolvedValue(calls);
    renderPage();
    expect(await screen.findByText('Convocatoria Alpha')).toBeInTheDocument();
    expect(screen.getByText('Convocatoria Beta')).toBeInTheDocument();
  });

  it('muestra mensaje de error si falla la carga', async () => {
    mockCallService.getAll.mockRejectedValue(new Error('Fallo de red'));
    renderPage();
    expect(await screen.findByText(/Fallo de red/)).toBeInTheDocument();
  });

  it('cambia el estado de una convocatoria tras confirmar en el modal', async () => {
    mockCallService.getAll.mockResolvedValue(calls);
    mockCallService.updateStatus.mockResolvedValue({ id: 1, status: 'CERRADA' } as any);
    renderPage();
    await screen.findByText('Convocatoria Alpha');
    await userEvent.click(screen.getByRole('button', { name: /cerrar convocatoria/i }));
    const confirmButtons = await screen.findAllByRole('button', { name: /cerrar convocatoria/i });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);
    await waitFor(() => expect(mockCallService.updateStatus).toHaveBeenCalledWith(1, 'CERRADA'));
  });
});
