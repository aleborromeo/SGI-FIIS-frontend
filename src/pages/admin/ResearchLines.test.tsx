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

  it('renders research lines list and table correctly', async () => {
    renderWithProviders(<ResearchLines />);

    expect(mockResearchService.getLines).toHaveBeenCalledWith(false);

    // Wait for row renders
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('handles search input filtering', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o código...');
    expect(searchInput).toBeDefined();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Ciber' } });
    });

    // Inteligencia Artificial should be filtered out, Ciberseguridad should remain
    expect(screen.queryByText('Inteligencia Artificial')).toBeNull();
    expect(screen.getByText('Ciberseguridad')).toBeDefined();
  });

  it('handles status dropdown filtering', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toBeDefined();

    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'active' } });
    });

    // Only active should show (Inteligencia Artificial is active, Ciberseguridad is inactive)
    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();
    expect(screen.queryByText('Ciberseguridad')).toBeNull();
  });

  it('handles sorting columns click', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const nameHeader = screen.getByText('Nombre');
    expect(nameHeader).toBeDefined();

    await act(async () => {
      nameHeader.click();
    });

    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();
  });

  it('opens confirmation modal and deactivates line', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const deactivateBtn = screen.getByRole('button', { name: 'Desactivar' });
    expect(deactivateBtn).toBeDefined();

    await act(async () => {
      deactivateBtn.click();
    });

    // Confirm dialog confirm button has text "Desactivar"
    const confirmModalBtn = await screen.findAllByRole('button', { name: 'Desactivar' });
    expect(confirmModalBtn[1]).toBeDefined(); // index 1 is modal confirm button

    await act(async () => {
      confirmModalBtn[1].click();
    });

    expect(mockResearchService.changeLineStatus).toHaveBeenCalledWith(1, false);
    expect(mockResearchService.getLines).toHaveBeenCalledTimes(2); // re-fetch after status change
  });

  it('opens edit modal, validates inputs, and updates line successfully', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    // Click first "Editar" button (Inteligencia Artificial)
    const editBtns = screen.getAllByRole('button', { name: 'Editar' });
    expect(editBtns[0]).toBeDefined();

    await act(async () => {
      editBtns[0].click();
    });

    // Edit modal should open
    expect(screen.getByText('Editar Línea de Investigación')).toBeDefined();

    // We can target input fields by placeholder or getting them by value/id
    const nameInput = screen.getByDisplayValue('Ciberseguridad');
    const codeInput = screen.getByDisplayValue('LI-02');
    const descInput = screen.getByDisplayValue('Línea de Ciberseguridad');

    // Test validation error by emptying name input
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '' } });
    });

    const saveBtn = screen.getByRole('button', { name: 'Guardar' });
    await act(async () => {
      saveBtn.click();
    });

    // Error message should show
    expect(screen.getByText('El nombre es obligatorio')).toBeDefined();

    // Re-fill and save
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Ciberseguridad Avanzada' } });
      fireEvent.change(codeInput, { target: { value: 'LI-02-A' } });
      fireEvent.change(descInput, { target: { value: 'Nueva descripción de Ciber' } });
    });

    await act(async () => {
      saveBtn.click();
    });

    expect(mockResearchService.updateLine).toHaveBeenCalledWith(2, {
      lineName: 'Ciberseguridad Avanzada',
      lineCode: 'LI-02-A',
      description: 'Nueva descripción de Ciber',
    });
    expect(mockResearchService.getLines).toHaveBeenCalledTimes(2); // re-fetch after edit
  });

  it('navigates to create line page on New button click', async () => {
    renderWithProviders(<ResearchLines />);
    expect(await screen.findByText('Inteligencia Artificial')).toBeDefined();

    const newBtn = screen.getByRole('button', { name: 'Nueva Línea' });
    expect(newBtn).toBeDefined();

    await act(async () => {
      newBtn.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/lines/new');
  });
});

