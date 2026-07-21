import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SubsanacionPanel } from './SubsanacionPanel';

const { mockGetById, mockGetObservaciones, mockSubsanar } = vi.hoisted(() => ({
  mockGetById: vi.fn(),
  mockGetObservaciones: vi.fn(),
  mockSubsanar: vi.fn(),
}));

vi.mock('../../services/tramiteService', () => ({
  tramiteService: {
    getById: mockGetById,
    getObservacionesByTramite: mockGetObservaciones,
    subsanarObservacion: mockSubsanar,
  },
}));

const mockTramite = {
  id: 1,
  codigoTramite: 'TRM-2026-0001',
  tipoTramite: 'PROYECTO',
  tituloReferencia: 'Proyecto de Riego',
  estadoActual: 'OBSERVADO',
} as any;

const mockObservaciones = [
  {
    id: 10,
    estadoObservacion: 'PENDIENTE',
    tipoObservacion: 'FORMATO',
    rolRevisor: 'DIRECTOR_INVESTIGACION',
    fechaRegistro: '2026-01-02T10:00:00Z',
    descripcion: 'El informe debe tener carátula firmada.',
    subsanaciones: [],
  },
] as any;

const renderPage = (entry = '/panel?tramiteId=1') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <SubsanacionPanel />
    </MemoryRouter>
  );

describe('SubsanacionPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetById.mockResolvedValue(mockTramite);
    mockGetObservaciones.mockResolvedValue(mockObservaciones);
    mockSubsanar.mockResolvedValue({});
  });

  it('renders the title and the pending observation', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /Subsanaci/i })
    ).toBeDefined();
    expect(await screen.findByText('El informe debe tener carátula firmada.')).toBeDefined();
  });

  it('shows an error when no tramite id is provided', async () => {
    renderPage('/panel');
    expect(await screen.findByText(/No se indic/i)).toBeDefined();
    expect(screen.getByText(/Volver a la bandeja/i)).toBeDefined();
  });

  it('registers a subsanacion for a pending observation', async () => {
    renderPage();

    const textarea = await screen.findByLabelText(/Descripci/i);
    fireEvent.change(textarea, { target: { value: 'Se adjunta carátula firmada.' } });

    fireEvent.click(screen.getByRole('button', { name: /Registrar subsanaci/i }));

    await waitFor(() => expect(mockSubsanar).toHaveBeenCalled());
    expect(mockSubsanar).toHaveBeenCalledWith(
      10,
      'Se adjunta carátula firmada.',
      null
    );
    expect(await screen.findByText(/registrada correctamente/i)).toBeDefined();
  });
});
