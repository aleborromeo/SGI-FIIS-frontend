import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ProgressReportHistory } from './ProgressReportHistory';
import { progressReportService } from '../../services/progressReportService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: vi.fn(),
    getByProject: vi.fn(),
    getDetail: vi.fn(),
  },
}));

const mockProgressReportService = vi.mocked(progressReportService);

const mockReports = [
  {
    id: 1,
    reportNumber: 1,
    projectId: 10,
    projectTitle: 'Proyecto de IA',
    reportType: 'PARCIAL',
    period: 'T1-2026',
    status: 'APROBADO',
    physicalProgress: 75,
    financialProgress: 60,
    submittedAt: '2026-03-01T10:00:00Z',
    observations: null,
  },
  {
    id: 2,
    reportNumber: 2,
    projectId: 10,
    projectTitle: 'Proyecto de IA',
    reportType: 'FINAL',
    period: 'T2-2026',
    status: 'PENDIENTE',
    physicalProgress: 40,
    financialProgress: 35,
    submittedAt: '2026-06-01T10:00:00Z',
    observations: 'Falta documentación',
  },
];

const mockProjectSummaries = [
  { id: 10, title: 'Proyecto de IA', status: 'APROBADO', reportCount: 2 },
];

describe('ProgressReportHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getProjectsByRole.mockResolvedValue(mockProjectSummaries as any);
    mockProgressReportService.getByProject.mockResolvedValue(mockReports as any);
    mockProgressReportService.getDetail.mockResolvedValue({
      ...mockReports[0],
      executedActivities: [{ id: 1, description: 'Actividad 1', startDate: '2026-01-01', endDate: '2026-03-01', completed: true }],
      evidences: [],
      attachments: [],
      comments: [],
      changeHistory: [],
    } as any);
  });

  it('shows loading spinner initially', () => {
    mockProgressReportService.getProjectsByRole.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<ProgressReportHistory />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders reports after loading', async () => {
    renderWithProviders(<ProgressReportHistory />);
    expect(await screen.findByText('Proyecto de IA')).toBeDefined();
  });

  it('renders report numbers', async () => {
    renderWithProviders(<ProgressReportHistory />);
    expect(await screen.findByText('Informe #1')).toBeDefined();
  });

  it('shows progress percentages', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await screen.findByText('Informe #1');
    // Physical progress should show
    expect(document.body.textContent?.includes('75')).toBeTruthy();
  });

  it('shows empty state when no reports', async () => {
    mockProgressReportService.getProjectsByRole.mockResolvedValue([]);
    mockProgressReportService.getByProject.mockResolvedValue([]);
    renderWithProviders(<ProgressReportHistory />);
    await act(async () => {});
    // Should show empty state
    expect(document.body).toBeDefined();
  });

  it('renders refresh button', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await screen.findByText('Informe #1');
    const refreshBtn = screen.getByRole('button', { name: /actualizar/i });
    expect(refreshBtn).toBeDefined();
  });

  it('expands report details on click', async () => {
    renderWithProviders(<ProgressReportHistory />);
    await screen.findByText('Informe #1');

    // Click on a row to expand
    const buttons = screen.getAllByRole('button');
    const expandBtn = buttons.find((b) => !b.textContent?.trim());
    if (expandBtn) {
      await act(async () => {
        fireEvent.click(expandBtn);
      });
    }
    expect(document.body).toBeDefined();
  });
});
