import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TramitesInbox } from './TramitesInbox';
import { tramiteService } from '../../services/tramiteService';
import type { Tramite } from '../../types/tramites';

// Mock the tramiteService
vi.mock('../../services/tramiteService', () => ({
  PENDING_STATE_BY_ROLE: {
    COORDINADOR_GRUPO: 'PENDIENTE_COORDINADOR',
    DIRECTOR_INVESTIGACION: 'PENDIENTE_DIRECCION',
    DECANO: 'PENDIENTE_DECANATO',
  },
  tramiteService: {
    getMyProcedures: vi.fn(),
    getPendingForRole: vi.fn(),
  },
}));

const mockTramites: Tramite[] = [
  {
    id: 1,
    codigoTramite: 'TRM-2026-000101',
    tipoTramite: 'PLAN_TESIS',
    tituloReferencia: 'Sistema de riego inteligente para cultivos de cacao',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'PENDIENTE_COORDINADOR',
    rolRevisorActual: 'COORDINADOR_GRUPO',
    observacionActual: null,
    fechaCreacion: '2026-06-20T09:15:00',
    fechaActualizacion: '2026-06-20T09:15:00',
  },
  {
    id: 2,
    codigoTramite: 'TRM-2026-000102',
    tipoTramite: 'PROYECTO',
    tituloReferencia: 'Impacto de la IA en la cadena de suministro',
    idSolicitante: 2,
    nombreSolicitante: 'José Evaristo',
    estadoActual: 'OBSERVADO',
    rolRevisorActual: null,
    observacionActual: 'Falta la firma del asesor.',
    fechaCreacion: '2026-06-15T10:00:00',
    fechaActualizacion: '2026-06-28T16:40:00',
  },
];

describe('TramitesInbox', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the title correctly', async () => {
    vi.mocked(tramiteService.getMyProcedures).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <TramitesInbox />
      </MemoryRouter>
    );
    expect(screen.getByText('Bandeja de Trámites')).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('No se encontraron trámites con los filtros actuales.')).toBeDefined();
    });
  });

  it('shows the loading spinner while data is being fetched', () => {
    vi.mocked(tramiteService.getMyProcedures).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <TramitesInbox />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Cargando...')).toBeDefined();
  });

  it('renders the mock tramites with their estado and actions', async () => {
    vi.mocked(tramiteService.getMyProcedures).mockResolvedValue(mockTramites);
    render(
      <MemoryRouter>
        <TramitesInbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TRM-2026-000101')).toBeDefined();
      expect(screen.getByText('TRM-2026-000102')).toBeDefined();
    });
    // Estado legible del trámite observado (badge + opción del filtro)
    expect(screen.getAllByText('Observado').length).toBeGreaterThan(0);
    // El trámite OBSERVADO del solicitante ofrece la acción de subsanar
    expect(screen.getByRole('button', { name: /Subsanar/i })).toBeDefined();
  });
});
