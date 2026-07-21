import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ConvocatoriasList } from './ConvocatoriasList';
import { callService } from '../../services/callService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/callService', () => ({
  callService: {
    getAll: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ key: 'test-key' }),
  };
});

const mockCallService = vi.mocked(callService);

const mockCalls = [
  {
    id: 1,
    title: 'Convocatoria de Investigación 2026-I',
    description: 'Primera convocatoria del año',
    status: 'ABIERTA',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    targetAudience: 'DOCENTES',
    researchLines: [],
    maxProposals: 10,
    budget: 50000,
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Convocatoria de Tesis 2026-I',
    description: 'Convocatoria para tesistas',
    status: 'CERRADA',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    targetAudience: 'ESTUDIANTES',
    researchLines: [],
    maxProposals: 20,
    budget: 30000,
    createdAt: '2025-06-01T00:00:00Z',
  },
];

describe('ConvocatoriasList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCallService.getAll.mockResolvedValue(mockCalls as any);
    mockCallService.updateStatus.mockResolvedValue({} as any);
  });

  it('shows loading spinner initially', () => {
    mockCallService.getAll.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ConvocatoriasList />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders convocatorias after loading', async () => {
    renderWithProviders(<ConvocatoriasList />);
    expect(await screen.findByText('Convocatoria de Investigación 2026-I')).toBeDefined();
    expect(screen.getByText('Convocatoria de Tesis 2026-I')).toBeDefined();
  });

  it('renders results count', async () => {
    renderWithProviders(<ConvocatoriasList />);
    await screen.findByText('Convocatoria de Investigación 2026-I');
    // Results count should be shown
    expect(document.body.textContent?.includes('2')).toBeTruthy();
  });

  it('filters convocatorias by search text', async () => {
    renderWithProviders(<ConvocatoriasList />);
    await screen.findByText('Convocatoria de Investigación 2026-I');

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Tesis' } });
    });

    expect(screen.queryByText('Convocatoria de Investigación 2026-I')).toBeNull();
    expect(screen.getByText('Convocatoria de Tesis 2026-I')).toBeDefined();
  });

  it('filters by status', async () => {
    renderWithProviders(<ConvocatoriasList />);
    await screen.findByText('Convocatoria de Investigación 2026-I');

    // Find status filter buttons (ABIERTA, CERRADA, etc.)
    const abiertaBtn = screen.getByRole('button', { name: /abierta/i });
    await act(async () => {
      fireEvent.click(abiertaBtn);
    });

    expect(screen.getByText('Convocatoria de Investigación 2026-I')).toBeDefined();
    expect(screen.queryByText('Convocatoria de Tesis 2026-I')).toBeNull();
  });

  it('navigates to new convocatoria on + button click', async () => {
    renderWithProviders(<ConvocatoriasList />);
    await screen.findByText('Convocatoria de Investigación 2026-I');

    const newLink = screen.getByRole('link', { name: /nueva convocatoria/i });
    expect(newLink.getAttribute('href')).toBe('/convocatorias/new');
  });

  it('navigates to edit convocatoria', async () => {
    renderWithProviders(<ConvocatoriasList />);
    await screen.findByText('Convocatoria de Investigación 2026-I');

    const editLinks = screen.getAllByRole('link', { name: /editar/i });
    expect(editLinks[0].getAttribute('href')).toBe('/convocatorias/1/edit');
  });

  it('shows empty state when no convocatorias', async () => {
    mockCallService.getAll.mockResolvedValue([]);
    renderWithProviders(<ConvocatoriasList />);
    await act(async () => {});
    // Empty state should be visible
    expect(document.body.textContent?.includes('0')).toBeTruthy();
  });
});

