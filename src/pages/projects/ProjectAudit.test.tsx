import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectAudit } from './ProjectAudit';

const { mockGetTraceability, mockList } = vi.hoisted(() => ({
  mockGetTraceability: vi.fn(),
  mockList: vi.fn(),
}));

vi.mock('../../services/auditService', () => ({
  auditService: { getTraceability: mockGetTraceability },
}));
vi.mock('../../services/documentService', () => ({
  documentService: { list: mockList },
}));

const mockMovements = [
  {
    movementId: 1,
    procedureId: 5,
    procedureCode: 'TRM-5',
    actionUserName: 'Ana Lopez',
    actionUserRole: null,
    action: 'APROBADO',
    previousStatus: 'PENDIENTE',
    newStatus: 'APROBADO',
    observation: 'Correcto',
    movementDate: '2026-06-01T10:00:00',
    ipOrigen: null,
  },
  {
    movementId: 2,
    procedureId: 5,
    procedureCode: 'TRM-5',
    actionUserName: 'Pedro Garcia',
    actionUserRole: null,
    action: 'REGISTRADO',
    previousStatus: '-',
    newStatus: 'PENDIENTE',
    observation: null,
    movementDate: '2026-06-02T10:00:00',
    ipOrigen: null,
  },
];

const mockDocuments = [
  { id: 1, fileName: 'doc1.pdf', fileType: 'pdf', fileUrl: '', active: true, uploadedAt: '2026-06-01' },
  { id: 2, fileName: 'doc2.pdf', fileType: 'pdf', fileUrl: '', active: false, uploadedAt: '2026-06-02' },
];

const renderWithProviders = () =>
  render(
    <MemoryRouter initialEntries={['/projects/audit?procedureId=5']}>
      <ProjectAudit />
    </MemoryRouter>
  );

describe('ProjectAudit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetTraceability.mockResolvedValue(mockMovements);
    mockList.mockResolvedValue(mockDocuments);
  });

  it('renders the audit page title', async () => {
    renderWithProviders();
    expect((await screen.findAllByText(/Auditor/i)).length).toBeGreaterThan(0);
  });

  it('loads and displays movements, documents and participants', async () => {
    renderWithProviders();
    expect(await screen.findByText('Ana Lopez')).toBeDefined();
    expect(screen.getByText('doc1.pdf')).toBeDefined();
    expect(screen.getByText('Pedro Garcia')).toBeDefined();
    expect(screen.getAllByText('APROBADO').length).toBeGreaterThan(0);
  });

  it('filters the traceability by search term', async () => {
    const { container } = renderWithProviders();
    await screen.findByText('Ana Lopez');

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ana' } });

    await waitFor(() => {
      expect(screen.queryByText('REGISTRADO')).toBeNull();
    });
    expect(screen.queryByText('doc1.pdf')).toBeNull();
    expect(screen.getAllByText('Ana Lopez').length).toBeGreaterThan(0);
  });
});
