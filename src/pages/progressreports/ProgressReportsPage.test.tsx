import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressReportsPage } from './ProgressReportsPage';
import { ToastProvider } from '../../context/ToastContext';

const { mockGetByProject } = vi.hoisted(() => ({ mockGetByProject: vi.fn() }));

vi.mock('../../services/progressReportService', () => ({
  progressReportService: {
    getByProject: mockGetByProject,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <ProgressReportsPage />
    </ToastProvider>
  );

describe('ProgressReportsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetByProject.mockResolvedValue([]);
  });

  it('renders the title and the empty table message', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Informes de Avance/i })).toBeDefined();
    expect(
      screen.getByText(/No hay informes para mostrar\. Busque un proyecto o registre uno nuevo\./i)
    ).toBeDefined();
  });

  it('shows a validation toast when searching with an empty project id', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));
    expect(await screen.findByText(/Ingrese un ID de proyecto/i)).toBeDefined();
    expect(mockGetByProject).not.toHaveBeenCalled();
  });

  it('renders reports returned by the search', async () => {
    mockGetByProject.mockResolvedValue([
      { id: 7, type: 'PARCIAL', percentage: 50, status: 'APPROVED' },
    ]);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/Ingrese ID del Proyecto/i), {
      target: { value: '7' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }));

    expect(await screen.findByText('#7')).toBeDefined();
    expect(screen.getByText('PARCIAL')).toBeDefined();
    expect(screen.getByText('APPROVED')).toBeDefined();
    expect(mockGetByProject).toHaveBeenCalledWith(7);
  });
});
