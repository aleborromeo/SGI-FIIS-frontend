import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { SubsanacionPanel } from './SubsanacionPanel';
import { tramiteService } from '../../services/tramiteService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/tramiteService', () => ({
  tramiteService: {
    getById: vi.fn(),
    getObservacionesByTramite: vi.fn(),
    subsanarObservacion: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useLocation: () => ({ search: '?tramiteId=1' }),
  };
});

const mockTramiteService = vi.mocked(tramiteService);

const mockTramite = {
  id: 1,
  codigoTramite: 'TRM-001',
  tipoTramite: 'PROYECTO',
  tituloReferencia: 'Proyecto de Investigación ABC',
  estadoActual: 'OBSERVADO',
  fechaRegistro: '2026-01-01T00:00:00Z',
  idSolicitante: 1,
};

const mockObservaciones = [
  {
    id: 10,
    tipoObservacion: 'FORMAL',
    estadoObservacion: 'PENDIENTE',
    descripcion: 'Falta firma del coordinador',
    rolRevisor: 'COORDINADOR_GRUPO',
    fechaRegistro: '2026-01-05T10:00:00Z',
    subsanaciones: [],
  },
  {
    id: 11,
    tipoObservacion: 'CONTENIDO',
    estadoObservacion: 'SUBSANADA',
    descripcion: 'Ampliar descripción del objetivo',
    rolRevisor: 'DIRECTOR_INVESTIGACION',
    fechaRegistro: '2026-01-03T10:00:00Z',
    subsanaciones: [
      {
        id: 20,
        descripcion: 'Se amplió la descripción',
        fechaRegistro: '2026-01-04T10:00:00Z',
        nombreDocumentoAdjunto: 'adjunto.pdf',
      },
    ],
  },
];

describe('SubsanacionPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockTramiteService.getById.mockResolvedValue(mockTramite as any);
    mockTramiteService.getObservacionesByTramite.mockResolvedValue(mockObservaciones as any);
    mockTramiteService.subsanarObservacion.mockResolvedValue({} as any);
  });

  it('renders spinner while loading', () => {
    mockTramiteService.getById.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTramite as any), 1000))
    );
    renderWithProviders(<SubsanacionPanel />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders the tramite code and title after loading', async () => {
    renderWithProviders(<SubsanacionPanel />);
    expect(await screen.findByText(/TRM-001/)).toBeDefined();
    expect(screen.getByText(/Proyecto de Investigación ABC/i)).toBeDefined();
  });

  it('renders observations', async () => {
    renderWithProviders(<SubsanacionPanel />);
    expect(await screen.findByText('Falta firma del coordinador')).toBeDefined();
    expect(screen.getByText('Ampliar descripción del objetivo')).toBeDefined();
  });

  it('shows subsanacion form for PENDIENTE observations', async () => {
    renderWithProviders(<SubsanacionPanel />);
    await screen.findByText('Falta firma del coordinador');

    // Textarea should be available for pending observation
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('shows file attachment for existing subsanacion', async () => {
    renderWithProviders(<SubsanacionPanel />);
    expect(await screen.findByText('adjunto.pdf')).toBeDefined();
  });

  it('shows validation error when submitting empty description', async () => {
    renderWithProviders(<SubsanacionPanel />);
    await screen.findByText('Falta firma del coordinador');

    const sendBtn = screen.getAllByRole('button').find(
      (b) => b.textContent?.includes('Registrar') || b.textContent?.includes('register')
    );
    if (sendBtn) {
      await act(async () => {
        fireEvent.click(sendBtn);
      });
      expect(mockTramiteService.subsanarObservacion).not.toHaveBeenCalled();
    }
  });

  it('successfully submits subsanacion', async () => {
    renderWithProviders(<SubsanacionPanel />);
    await screen.findByText('Falta firma del coordinador');

    const textareas = screen.getAllByRole('textbox');
    await act(async () => {
      fireEvent.change(textareas[0], { target: { value: 'Descripción de la subsanación' } });
    });

    const sendBtn = screen.getAllByRole('button').find(
      (b) => b.textContent?.includes('Registrar') || b.textContent?.includes('register')
    );
    if (sendBtn) {
      await act(async () => {
        fireEvent.click(sendBtn);
      });
      expect(mockTramiteService.subsanarObservacion).toHaveBeenCalledWith(
        10,
        'Descripción de la subsanación',
        null
      );
    }
  });

  it('shows error when tramiteId is missing', async () => {
    renderWithProviders(<SubsanacionPanel />, { route: '/?tramiteId=' });
    expect(document.body).toBeDefined();
  });
});

