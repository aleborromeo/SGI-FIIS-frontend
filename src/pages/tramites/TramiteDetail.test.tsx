import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TramiteDetail } from './TramiteDetail';
import { tramiteService } from '../../services/tramiteService';
import type { MovimientoTramite, Tramite } from '../../types/tramites';

// Mock the tramiteService
vi.mock('../../services/tramiteService', () => ({
  PENDING_STATE_BY_ROLE: {
    COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
    DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
    DECANO: 'PENDIENTE_DECANATO',
  },
  tramiteService: {
    getById: vi.fn(),
    getTraceability: vi.fn(),
    getObservacionesByTramite: vi.fn(),
    approve: vi.fn(),
    flag: vi.fn(),
    reject: vi.fn(),
    remediate: vi.fn(),
    registerResolution: vi.fn(),
  },
}));

const mockTramite: Tramite = {
  id: 2,
  codigoTramite: 'TRM-2026-000102',
  tipoTramite: 'PROYECTO',
  tituloReferencia: 'Impacto de la IA en la cadena de suministro',
  idSolicitante: 2,
  nombreSolicitante: 'José Evaristo',
  estadoActual: 'OBSERVADO',
  thesisReferenceId: null,
  projectReferenceId: null,
  reportReferenceId: null,
  rolRevisorActual: null,
  observacionActual: 'Falta la firma del asesor en la carátula.',
  fechaCreacion: '2026-06-15T10:00:00',
  fechaActualizacion: '2026-06-28T16:40:00',
};

const mockMovimientos: MovimientoTramite[] = [
  {
    id: 1,
    idTramite: 2,
    idUsuarioAccion: 2,
    nombreUsuarioAccion: 'José Evaristo',
    accion: 'PRESENTADO_POR_SOLICITANTE',
    estadoAnterior: 'REGISTRADO',
    estadoNuevo: 'PENDIENTE_COORDINADOR',
    observacion: null,
    fechaMovimiento: '2026-06-15T10:00:00',
  },
  {
    id: 2,
    idTramite: 2,
    idUsuarioAccion: 4,
    nombreUsuarioAccion: 'Carlos Ramos',
    accion: 'OBSERVADO_POR_COORDINADOR',
    estadoAnterior: 'PENDIENTE_COORDINADOR',
    estadoNuevo: 'OBSERVADO',
    observacion: 'Falta la firma del asesor en la carátula.',
    fechaMovimiento: '2026-06-28T16:40:00',
  },
];

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={['/tramites/2']}>
      <Routes>
        <Route path="/tramites/:id" element={<TramiteDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe('TramiteDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the loading spinner while data is being fetched', () => {
    vi.mocked(tramiteService.getById).mockReturnValue(new Promise(() => {}));
    vi.mocked(tramiteService.getTraceability).mockReturnValue(new Promise(() => {}));
    vi.mocked(tramiteService.getObservacionesByTramite).mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByLabelText('Cargando...')).toBeDefined();
  });

  it('renders the tramite data and the observacion vigente', async () => {
    vi.mocked(tramiteService.getById).mockResolvedValue(mockTramite);
    vi.mocked(tramiteService.getTraceability).mockResolvedValue(mockMovimientos);
    vi.mocked(tramiteService.getObservacionesByTramite).mockResolvedValue([]);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });
    expect(screen.getByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
    expect(screen.getByText('Observación vigente')).toBeDefined();
    expect(screen.getByText('Falta la firma del asesor en la carátula.')).toBeDefined();
  });

  it('renders the trazabilidad timeline with the movimientos', async () => {
    vi.mocked(tramiteService.getById).mockResolvedValue(mockTramite);
    vi.mocked(tramiteService.getTraceability).mockResolvedValue(mockMovimientos);
    vi.mocked(tramiteService.getObservacionesByTramite).mockResolvedValue([]);
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Trazabilidad del Trámite')).toBeDefined();
    });
    expect(screen.getByText('Presentado por el solicitante')).toBeDefined();
    expect(screen.getByText('Observado por el Coordinador')).toBeDefined();
  });
});
