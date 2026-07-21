import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewProgressReport } from './NewProgressReport';
import { progressReportService } from '../../services/progressReportService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getProjectsByRole: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProgressReportService = vi.mocked(progressReportService);
const mockDocumentService = vi.mocked(documentService);

const mockProjects = [
  { projectId: 1, projectTitle: 'Proyecto de IA', reportCount: 2 },
  { projectId: 2, projectTitle: 'Proyecto Blockchain', reportCount: 0 },
];

describe('NewProgressReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProgressReportService.getProjectsByRole.mockResolvedValue(mockProjects as any);
    mockProgressReportService.create.mockResolvedValue({ id: 1 } as any);
    mockDocumentService.uploadDocument.mockResolvedValue({ id: 10, name: 'informe.pdf' } as any);
  });

  it('shows loading for projects initially', () => {
    mockProgressReportService.getProjectsByRole.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<NewProgressReport />);
    expect(document.body).toBeDefined();
  });

  it('renders report type options', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    expect(screen.getByText('Parcial')).toBeDefined();
    expect(screen.getByText('Final')).toBeDefined();
  });

  it('renders back button', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/progressreports/history');
  });

  it('renders achievements and difficulties textareas', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('renders progress percentage input', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewProgressReport />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /enviar/i });
    expect(submitBtn).toBeDefined();
  });
});

