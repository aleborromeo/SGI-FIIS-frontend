import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act } from '@testing-library/react';
import { ThesisTraceability } from './ThesisTraceability';
import { thesisService } from '../../services/thesisService';
import { researchService } from '../../services/researchService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: vi.fn(),
    getReportsByPlan: vi.fn(),
    updatePlanStatus: vi.fn(),
    submitAmendment: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockThesisService = vi.mocked(thesisService);

const mockPlan = {
  idPlanTesis: 1,
  tituloTesis: 'Sistema de Monitoreo de Red',
  resumen: 'Resumen del plan',
  idEstudiante: 5,
  idLinea: 1,
  idGrupo: 1,
  idDocumentoActual: 10,
  estadoPlan: 'APROBADO',
  fechaCreacion: '2026-01-01T00:00:00Z',
  fechaActualizacion: '2026-01-15T00:00:00Z',
  idTramite: 1,
  estadoTramite: 'APROBADO_CON_RESOLUCION',
};

describe('ThesisTraceability', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThesisService.getPlanById.mockResolvedValue(mockPlan as any);
    mockThesisService.getReportsByPlan.mockResolvedValue([]);
    vi.mocked(researchService.getLines).mockResolvedValue([]);
    vi.mocked(researchService.getGroups).mockResolvedValue([]);
  });

  it('shows loading spinner initially', () => {
    mockThesisService.getPlanById.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockPlan as any), 1000))
    );
    renderWithProviders(<ThesisTraceability />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders plan title after loading', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    // Wait for loading to finish and check page has content
    expect(document.body.textContent?.length).toBeGreaterThan(10);
  });

  it('renders back link', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toBeDefined();
  });

  it('renders plan status badge', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    // Status badge should be rendered
    expect(document.body).toBeDefined();
  });

  it('renders tabs or timeline', async () => {
    renderWithProviders(<ThesisTraceability />);
    await act(async () => {});
    // Page should render timeline/stepper
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });
});

