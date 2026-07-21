import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ProgressReportsPage } from './ProgressReportsPage';
import { progressReportService } from '../../services/progressReportService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getByProject: vi.fn(),
  },
}));

const mockProgressReportService = vi.mocked(progressReportService);

describe('ProgressReportsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getByProject.mockResolvedValue([
      { id: 1, type: 'PARCIAL', percentage: 50, status: 'PENDING' },
      { id: 2, type: 'FINAL', percentage: 100, status: 'APPROVED' },
    ] as any);
  });

  it('renders the page title', () => {
    renderWithProviders(<ProgressReportsPage />);
    expect(screen.getByText('Informes de Avance')).toBeDefined();
  });

  it('renders search section with input and button', () => {
    renderWithProviders(<ProgressReportsPage />);
    expect(screen.getByPlaceholderText(/ID del Proyecto/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Buscar/i })).toBeDefined();
  });

  it('renders new report button', () => {
    renderWithProviders(<ProgressReportsPage />);
    expect(screen.getByRole('button', { name: /Nuevo Informe/i })).toBeDefined();
  });

  it('shows empty state initially', () => {
    renderWithProviders(<ProgressReportsPage />);
    expect(screen.getByText(/No hay informes para mostrar/i)).toBeDefined();
  });

  it('shows error toast when searching without projectId', async () => {
    renderWithProviders(<ProgressReportsPage />);
    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });
    expect(mockProgressReportService.getByProject).not.toHaveBeenCalled();
  });

  it('searches and displays reports in table', async () => {
    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(mockProgressReportService.getByProject).toHaveBeenCalledWith('42');
    expect(await screen.findByText('#1')).toBeDefined();
    expect(screen.getByText('#2')).toBeDefined();
  });

  it('shows toast info and empty state when search returns no results', async () => {
    mockProgressReportService.getByProject.mockResolvedValue([] as any);

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '99' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(await screen.findByText('No se encontraron informes para este proyecto')).toBeDefined();
  });

  it('shows toast error when search fails', async () => {
    mockProgressReportService.getByProject.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(await screen.findByText('Network error')).toBeDefined();
  });

  it('shows Buscando... text while search is loading', async () => {
    let resolveSearch: (value: any) => void;
    mockProgressReportService.getByProject.mockImplementation(
      () => new Promise((resolve) => { resolveSearch = resolve; })
    );

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(screen.getByText('Buscando...')).toBeDefined();

    await act(async () => {
      resolveSearch!([{ id: 1, type: 'PARCIAL', percentage: 50, status: 'PENDING' }]);
    });

    expect(screen.queryByText('Buscando...')).toBeNull();
    expect(screen.getByText('Buscar')).toBeDefined();
  });

  it('displays report type, percentage, and status in table', async () => {
    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    expect(await screen.findByText('PARCIAL')).toBeDefined();
    expect(screen.getByText('FINAL')).toBeDefined();
    expect(screen.getByText('50%')).toBeDefined();
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('PENDING')).toBeDefined();
    expect(screen.getByText('APPROVED')).toBeDefined();
  });

  it('renders Ver Detalle buttons for each report', async () => {
    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    await screen.findByText('#1');
    const detailBtns = screen.getAllByRole('button', { name: /Ver Detalle/i });
    expect(detailBtns.length).toBe(2);
  });

  it('renders badge with success variant for APPROVED status', async () => {
    mockProgressReportService.getByProject.mockResolvedValue([
      { id: 1, type: 'FINAL', percentage: 100, status: 'APPROVED' },
    ] as any);

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    const badge = await screen.findByText('APPROVED');
    expect(badge.closest('.badge-success')).toBeDefined();
  });

  it('renders badge with error variant for REJECTED status', async () => {
    mockProgressReportService.getByProject.mockResolvedValue([
      { id: 1, type: 'PARCIAL', percentage: 30, status: 'REJECTED' },
    ] as any);

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    const badge = await screen.findByText('REJECTED');
    expect(badge.closest('.badge-error')).toBeDefined();
  });

  it('renders badge with warning variant for default status', async () => {
    mockProgressReportService.getByProject.mockResolvedValue([
      { id: 1, type: 'PARCIAL', percentage: 20, status: 'PENDING' },
    ] as any);

    renderWithProviders(<ProgressReportsPage />);

    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    const badge = await screen.findByText('PENDING');
    expect(badge.closest('.badge-warning')).toBeDefined();
  });
});
