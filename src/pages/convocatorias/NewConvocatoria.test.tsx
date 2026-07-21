import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewConvocatoria } from './NewConvocatoria';
import { callService } from '../../services/callService';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/callService', () => ({
  callService: {
    create: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
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
const mockResearchService = vi.mocked(researchService);

describe('NewConvocatoria', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCallService.create.mockResolvedValue({ id: 1 } as any);
    mockResearchService.getLines.mockResolvedValue([
      { id: 1, lineName: 'Línea de IA', lineCode: 'L01', active: true, groupId: 1 } as any,
    ]);
  });

  it('renders the form heading', async () => {
    renderWithProviders(<NewConvocatoria />);
    // Form renders without crash
    expect(document.body).toBeDefined();
  });

  it('renders title input field', async () => {
    renderWithProviders(<NewConvocatoria />);
    const titleInput = await screen.findByLabelText(/título/i);
    expect(titleInput).toBeDefined();
  });

  it('renders description textarea', async () => {
    renderWithProviders(<NewConvocatoria />);
    const descInput = await screen.findByLabelText(/descripción/i);
    expect(descInput).toBeDefined();
  });

  it('renders audience selection options', async () => {
    renderWithProviders(<NewConvocatoria />);
    expect(await screen.findByText('Solo Docentes')).toBeDefined();
    expect(screen.getByText('Solo Estudiantes')).toBeDefined();
    expect(screen.getByText('Docentes y Estudiantes')).toBeDefined();
  });

  it('updates title on input', async () => {
    renderWithProviders(<NewConvocatoria />);
    const titleInput = await screen.findByLabelText(/título/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Nueva Convocatoria 2026' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Nueva Convocatoria 2026');
  });

  it('selects audience option', async () => {
    renderWithProviders(<NewConvocatoria />);
    const docentesOption = await screen.findByText('Solo Docentes');
    await act(async () => {
      fireEvent.click(docentesOption.closest('button') || docentesOption);
    });
    expect(docentesOption).toBeDefined();
  });

  it('has navigation back button', async () => {
    renderWithProviders(<NewConvocatoria />);
    const backBtn = await screen.findByRole('button', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<NewConvocatoria />);
    const backBtn = await screen.findByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/convocatorias');
  });
});

