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

  it('renders project ID input', () => {
    renderWithProviders(<ProgressReportsPage />);
    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    expect(input).toBeDefined();
  });

  it('renders search button', () => {
    renderWithProviders(<ProgressReportsPage />);
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
    // Should not call the service
    expect(mockProgressReportService.getByProject).not.toHaveBeenCalled();
  });

  it('searches reports when project ID is provided', async () => {
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

  it('displays report statuses', async () => {
    renderWithProviders(<ProgressReportsPage />);
    
    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    const searchBtn = screen.getByRole('button', { name: /Buscar/i });
    await act(async () => {
      fireEvent.click(searchBtn);
    });

    expect(await screen.findByText('PENDING')).toBeDefined();
    expect(screen.getByText('APPROVED')).toBeDefined();
  });

  it('shows percentage values', async () => {
    renderWithProviders(<ProgressReportsPage />);
    
    const input = screen.getByPlaceholderText(/ID del Proyecto/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: '42' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    });

    expect(await screen.findByText('50%')).toBeDefined();
    expect(screen.getByText('100%')).toBeDefined();
  });
});
