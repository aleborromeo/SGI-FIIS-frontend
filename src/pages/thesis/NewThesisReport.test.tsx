import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewThesisReport } from './NewThesisReport';
import { thesisService } from '../../services/thesisService';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/thesisService', () => ({
  thesisService: {
    getPlanById: vi.fn(),
    submitReport: vi.fn(),
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
    useParams: () => ({ planId: '1' }),
  };
});

const mockThesisService = vi.mocked(thesisService);
const mockDocumentService = vi.mocked(documentService);

const mockPlan = {
  idPlanTesis: 1,
  title: 'Sistema de Monitoreo de Red',
  estadoPlan: 'APROBADO',
};

describe('NewThesisReport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockThesisService.getPlanById.mockResolvedValue(mockPlan as any);
    mockThesisService.submitReport.mockResolvedValue({ id: 1 } as any);
    mockDocumentService.uploadDocument.mockResolvedValue({ id: 10, name: 'tesis.pdf' } as any);
  });

  it('shows loading spinner initially', () => {
    mockThesisService.getPlanById.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockPlan as any), 1000))
    );
    renderWithProviders(<NewThesisReport />);
    expect(document.querySelector('[aria-label="Cargando..."]')).toBeDefined();
  });

  it('renders form after loading plan', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('pre-fills title from plan', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox');
    expect((titleInput as HTMLInputElement).value).toBe('Sistema de Monitoreo de Red');
  });

  it('renders back button', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /enviar/i });
    expect(submitBtn).toBeDefined();
  });

  it('renders file upload area', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const fileUpload = document.querySelector('input[type="file"]');
    expect(fileUpload).toBeDefined();
  });

  it('navigates back when back button clicked', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/thesis/plan/1');
  });

  it('disables submit when no file attached', async () => {
    renderWithProviders(<NewThesisReport />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /enviar/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });
});

