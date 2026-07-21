import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ProjectAudit } from './ProjectAudit';
import { auditService } from '../../services/auditService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/auditService', () => ({
  auditService: {
    getTraceability: vi.fn(),
    getRecentActivity: vi.fn(),
    getAuditLog: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    getByProject: vi.fn(),
    list: vi.fn(),
    downloadFile: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams('procedureId=1&projectTitle=Proyecto+IA')],
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
      <a href={to} {...props}>{children}</a>
    ),
  };
});

const mockAuditService = vi.mocked(auditService);
const mockDocumentService = vi.mocked(documentService);

const mockMovements = [
  {
    movementId: 1,
    procedureId: 1,
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
    procedureId: 1,
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

const mockDocuments = [
  {
    id: 1,
    fileName: 'Propuesta_Investigacion.pdf',
    fileUrl: '/docs/1',
    fileType: 'pdf',
    fileSize: 1024,
    uploadedBy: 1,
    uploadedAt: '2026-01-01T10:00:00Z',
    active: true,
  },
];

describe('ProjectAudit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAuditService.getTraceability.mockResolvedValue(mockMovements as any);
    mockAuditService.getRecentActivity.mockResolvedValue([]);
    mockDocumentService.list.mockResolvedValue(mockDocuments as any);
    mockDocumentService.getByProject.mockResolvedValue([]);
  });

  it('shows loading spinner initially', () => {
    mockAuditService.getTraceability.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    mockDocumentService.list.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ProjectAudit />);
    expect(screen.getByLabelText(/cargando/i)).toBeDefined();
  });

  it('renders audit trail entries after loading', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getByText('Carlos Director')).toBeDefined();
  });

  it('renders back link to projects', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    const backLink = screen.getByRole('link', { name: /volver a proyectos/i });
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/projects');
  });

  it('renders audit timeline actions', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getByText('REGISTRADO')).toBeDefined();
    expect(screen.getByText('APROBADO')).toBeDefined();
  });

  it('renders procedure ID badge', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeDefined();
    });
  });

  it('renders page heading', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText(/expediente digital/i)).toBeDefined();
    });
  });

  it('renders documents section', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getByText(/documentos del expediente/i)).toBeDefined();
  });

  it('renders participants section', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getAllByText(/participantes/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders audit record section', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getAllByText(/auditoría/i).length).toBeGreaterThan(0);
  });

  it('filters audit entries by search', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/buscar acciones/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Carlos' } });
    });

    expect(screen.getByText('Carlos Director')).toBeDefined();
  });

  it('shows empty state when no movements', async () => {
    mockAuditService.getTraceability.mockResolvedValue([]);
    mockDocumentService.list.mockResolvedValue([]);
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron movimientos/i)).toBeDefined();
    });
  });

  it('renders statistics cards', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getByText('Movimientos')).toBeDefined();
    expect(screen.getByText('Documentos')).toBeDefined();
    expect(screen.getByText('Participantes')).toBeDefined();
  });

  it('renders print button', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    const printBtn = screen.getByRole('button', { name: /imprimir/i });
    expect(printBtn).toBeDefined();
  });

  it('renders active file badge', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText(/expediente activo/i)).toBeDefined();
    });
  });

  it('shows unique participants', async () => {
    renderWithProviders(<ProjectAudit />);
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeDefined();
    });
    expect(screen.getByText('Carlos Director')).toBeDefined();
    expect(screen.getAllByText(/acción\(ones\)/i).length).toBeGreaterThan(0);
  });
});
