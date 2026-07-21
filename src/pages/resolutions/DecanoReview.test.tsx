import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { DecanoReview } from './DecanoReview';

const { mockGetPendingForRole, mockFlag, mockReject } = vi.hoisted(() => ({
  mockGetPendingForRole: vi.fn(),
  mockFlag: vi.fn(),
  mockReject: vi.fn(),
}));

vi.mock('../../services/tramiteService', () => ({
  PENDING_STATE_BY_ROLE: {
    COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
    DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
    DECANO: 'PENDIENTE_DECANATO',
  },
  tramiteService: {
    getPendingForRole: mockGetPendingForRole,
    flag: mockFlag,
    reject: mockReject,
  },
}));

const sampleTramite = (id: number, codigo: string) => ({
  id,
  codigoTramite: codigo,
  tipoTramite: 'PROYECTO',
  tituloReferencia: 'Referencia de prueba',
  estadoActual: 'PENDIENTE_DECANATO',
  fechaActualizacion: '2026-01-01T00:00:00',
});

const renderPage = () =>
  render(
    <ToastProvider>
      <AuthContext.Provider value={{ currentRole: 'DECANO' } as any}>
        <MemoryRouter>
          <DecanoReview />
        </MemoryRouter>
      </AuthContext.Provider>
    </ToastProvider>
  );

describe('DecanoReview (#159)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetPendingForRole.mockResolvedValue([]);
    mockFlag.mockResolvedValue({});
    mockReject.mockResolvedValue({});
  });

  it('renders the list of pending tramites for the decano', async () => {
    mockGetPendingForRole.mockResolvedValue([sampleTramite(1, 'TRM-001')]);
    renderPage();

    expect(await screen.findByText('TRM-001')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Firmar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Observar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Rechazar/i })
    ).toBeInTheDocument();
  });

  it('shows an error when loading fails', async () => {
    mockGetPendingForRole.mockRejectedValue(new Error('Error de carga'));
    renderPage();

    expect(await screen.findByText(/Error de carga/i)).toBeInTheDocument();
  });

  it('flags (observes) a tramite after the prompt is confirmed', async () => {
    mockGetPendingForRole.mockResolvedValue([sampleTramite(1, 'TRM-001')]);
    vi.spyOn(window, 'prompt').mockReturnValue('observacion de prueba');
    renderPage();

    const observe = await screen.findByRole('button', { name: /Observar/i });
    fireEvent.click(observe);

    await waitFor(() => expect(mockFlag).toHaveBeenCalledWith(1, 'observacion de prueba'));
  });

  it('rejects a tramite after the confirmation dialog', async () => {
    mockGetPendingForRole.mockResolvedValue([sampleTramite(1, 'TRM-001')]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();

    const reject = await screen.findByRole('button', { name: /Rechazar/i });
    fireEvent.click(reject);

    await waitFor(() => expect(mockReject).toHaveBeenCalledWith(1));
  });
});
