import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { AmendProgressReport } from './AmendProgressReport';
import { progressReportService } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getDetail: vi.fn(),
    amendReport: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '5' }),
  };
});

const mockProgressReportService = vi.mocked(progressReportService);

const mockReport = {
  id: 5,
  projectId: 10,
  projectTitle: 'Proyecto de IA',
  reportType: 'PARCIAL',
  period: 'T1-2026',
  status: 'OBSERVADO',
  physicalProgress: 50,
  financialProgress: 40,
  achievements: 'Primeros logros',
  difficulties: 'Problemas encontrados',
  recommendations: 'Recomendaciones',
  observations: 'Necesita correcciones',
  submittedAt: '2026-03-01T10:00:00Z',
  attachedDocumentId: null,
  activities: [],
  attachments: [],
  comments: [{ id: 1, authorName: 'Director', authorRole: 'DIRECTOR', content: 'Necesita correcciones', createdAt: '2026-03-02T10:00:00Z' }],
  executedActivities: [],
  evidences: [],
  changeHistory: [],
};

describe('AmendProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getDetail.mockResolvedValue(mockReport as any);
    mockProgressReportService.amendReport.mockResolvedValue({ id: 5 } as any);
  });

  it('shows loading spinner initially', () => {
    mockProgressReportService.getDetail.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockReport as any), 1000))
    );
    renderWithProviders(<AmendProgressReport />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders report data after loading', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(document.body.textContent?.includes('Proyecto de IA')).toBeTruthy();
  });

  it('renders observations alert', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(document.body.textContent?.includes('Necesita correcciones')).toBeTruthy();
  });

  it('renders report context data', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    expect(document.body.textContent?.includes('Proyecto de IA')).toBeTruthy();
    expect(document.body.textContent?.includes('T1-2026')).toBeTruthy();
  });

  it('renders back button', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });

  it('renders save button', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const saveBtn = screen.getByRole('button', { name: /enviar correcciones/i });
    expect(saveBtn).toBeDefined();
  });

  it('navigates back when back button clicked', async () => {
    renderWithProviders(<AmendProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
  });
});

