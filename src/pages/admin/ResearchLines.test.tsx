import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ResearchLines } from './ResearchLines';
import { researchService } from '../../services/researchService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    changeLineStatus: vi.fn(),
    updateLine: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ResearchLines page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockResearchService.getLines.mockResolvedValue([
      {
        id: 1,
        lineName: 'Inteligencia Artificial',
        lineCode: 'LI-01',
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        description: 'Línea de IA',
      },
      {
        id: 2,
        lineName: 'Ciberseguridad',
        lineCode: 'LI-02',
        active: false,
        createdAt: '2026-01-02T00:00:00Z',
        description: 'Línea de Ciberseguridad',
      },
    ] as any);

    mockResearchService.changeLineStatus.mockResolvedValue({} as any);
    mockResearchService.updateLine.mockResolvedValue({} as any);
  });

  it('renders lines after loading', async () => {
    renderWithProviders(<ResearchLines />);

    expect(mockResearchService.getLines).toHaveBeenCalledWith(false);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('shows empty state when no lines exist', async () => {
    mockResearchService.getLines.mockResolvedValue([]);
    renderWithProviders(<ResearchLines />);

    expect(await screen.findByText(/No se encontraron líneas/i)).toBeDefined();
  });

  it('filters lines by search term', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o código...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Ciber' } });
    });

    expect(screen.queryByText('Inteligencia Artificial')).toBeNull();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('navigates to create line page', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const newBtn = screen.getByRole('button', { name: /Nueva Línea/i });
    await act(async () => {
      fireEvent.click(newBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/lines/new');
  });

  it('opens edit modal for a line', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const editBtns = screen.getAllByRole('button', { name: /Editar/i });
    await act(async () => {
      editBtns[0].click();
    });

    expect(screen.getByText('Editar Línea de Investigación')).toBeDefined();
  });

  it('deactivates a line with confirmation', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const deactivateBtn = screen.getByRole('button', { name: /Desactivar/i });
    await act(async () => {
      fireEvent.click(deactivateBtn);
    });

    const confirmModalBtns = await screen.findAllByRole('button', { name: /Desactivar/i });
    const modalConfirmBtn = confirmModalBtns[confirmModalBtns.length - 1];
    await act(async () => {
      fireEvent.click(modalConfirmBtn);
    });

    expect(mockResearchService.changeLineStatus).toHaveBeenCalledWith(1, false);
    expect(mockResearchService.getLines).toHaveBeenCalledTimes(2);
  });

  it('shows loading state while fetching lines', async () => {
    mockResearchService.getLines.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ResearchLines />);

    const spinner = document.querySelector('.animate-fade-in');
    expect(spinner).toBeDefined();
  });
});
