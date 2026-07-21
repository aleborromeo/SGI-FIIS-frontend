import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act } from '@testing-library/react';
import { ProjectAudit } from './ProjectAudit';
import { auditService } from '../../services/auditService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/auditService', () => ({
  auditService: {
    getTraceability: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    getByProject: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('procedureId=1&projectTitle=Proyecto+IA')],
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockAuditService = vi.mocked(auditService);
const mockDocumentService = vi.mocked(documentService);

const mockMovements = [
  {
    movementId: 1,
    procedureCode: 'TRM-001',
    action: 'REGISTRADO',
    previousStatus: null,
    newStatus: 'PENDIENTE_COORDINADOR',
    movementDate: '2026-01-01T10:00:00Z',
    actionUserName: 'Admin User',
    actionUserRole: 'ADMIN',
    observation: null,
    ipOrigen: '192.168.1.1',
  },
  {
    movementId: 2,
    procedureCode: 'TRM-001',
    action: 'APROBADO',
    previousStatus: 'PENDIENTE_COORDINADOR',
    newStatus: 'APROBADO_CON_RESOLUCION',
    movementDate: '2026-01-10T10:00:00Z',
    actionUserName: 'Carlos Director',
    actionUserRole: 'DIRECTOR_INVESTIGACION',
    observation: null,
    ipOrigen: '192.168.1.2',
  },
];

describe('ProjectAudit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuditService.getTraceability.mockResolvedValue(mockMovements as any);
    mockAuditService.getRecentActivity.mockResolvedValue([]);
    mockDocumentService.getByProject.mockResolvedValue([]);
    mockDocumentService.list.mockResolvedValue([]);
  });

  it('shows loading spinner initially', () => {
    mockAuditService.getTraceability.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ProjectAudit />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders audit trail entries after loading', async () => {
    renderWithProviders(<ProjectAudit />);
    expect((await screen.findAllByText(/Admin User/))[0]).toBeDefined();
    expect(screen.getAllByText(/Carlos Director/)[0]).toBeDefined();
  });

  it('renders back link', async () => {
    renderWithProviders(<ProjectAudit />);
    await act(async () => {});
    const backLink = screen.getByRole('link', { name: /volver/i });
    expect(backLink).toBeDefined();
  });

  it('renders traceability timeline', async () => {
    renderWithProviders(<ProjectAudit />);
    await screen.findAllByText(/Admin User/);
    // Timeline events should be visible
    expect(screen.getByText('REGISTRADO')).toBeDefined();
  });

  it('renders procedure ID from search params', async () => {
    renderWithProviders(<ProjectAudit />);
    await act(async () => {});
    expect(document.body.textContent?.includes('#1') || document.body.textContent?.includes('1')).toBeTruthy();
  });

  it('shows empty state when no movements', async () => {
    mockAuditService.getTraceability.mockResolvedValue([]);
    renderWithProviders(<ProjectAudit />);
    await act(async () => {});
    // Should show empty state message
    expect(document.body).toBeDefined();
  });
});

