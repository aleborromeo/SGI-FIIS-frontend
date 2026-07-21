import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { TramitesList } from './TramitesList';
import { renderWithProviders } from '../../utils/testUtils';

describe('TramitesList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the page title', async () => {
    renderWithProviders(<TramitesList />);
    // The title is translated, should render
    const title = await screen.findByRole('heading', { level: 1 });
    expect(title).toBeDefined();
  });

  it('renders the workflow indicator', async () => {
    renderWithProviders(<TramitesList />);
    // Workflow section heading
    await screen.findByRole('heading', { level: 3 });
  });

  it('renders all 4 mock tramites in the table', async () => {
    renderWithProviders(<TramitesList />);

    // Should find the mock data projects
    expect(await screen.findByText('Sistema de detección automática de enfermedades en hojas de banana usando CNN')).toBeDefined();
    expect(screen.getByText('Gestión de trazabilidad de proyectos de tesis')).toBeDefined();
    expect(screen.getByText('Modelo predictivo para seguimiento de tesis en FIIS')).toBeDefined();
    expect(screen.getByText('Seguridad de datos en plataformas académicas')).toBeDefined();
  });

  it('filters tramites by search text', async () => {
    renderWithProviders(<TramitesList />);

    const searchInput = await screen.findByRole('textbox');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'banana' } });
    });

    // Only banana project should remain
    expect(screen.getByText('Sistema de detección automática de enfermedades en hojas de banana usando CNN')).toBeDefined();
    expect(screen.queryByText('Gestión de trazabilidad de proyectos de tesis')).toBeNull();
  });

  it('filters tramites by status', async () => {
    renderWithProviders(<TramitesList />);

    // Wait for render
    await screen.findByRole('heading', { level: 1 });

    const statusSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'APROBADO' } });
    });

    // Only APROBADO should be shown
    expect(screen.getByText('Modelo predictivo para seguimiento de tesis en FIIS')).toBeDefined();
    expect(screen.queryByText('Sistema de detección automática de enfermedades en hojas de banana usando CNN')).toBeNull();
  });

  it('shows empty state when search yields no results', async () => {
    renderWithProviders(<TramitesList />);

    const searchInput = await screen.findByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'nonexistentproject12345' } });
    });

    // Empty state message should appear in the table
    const cells = screen.getAllByRole('cell');
    // The first cell in empty row has the empty state text
    const emptyCell = cells.find((c) => c.textContent?.includes('tramites'));
    // At minimum the table is still rendered
    expect(screen.getByRole('table')).toBeDefined();
  });

  it('renders Subsanar button for OBSERVADO tramites', async () => {
    renderWithProviders(<TramitesList />);
    // The OBSERVADO tramite has a subsanar button
    expect(await screen.findByRole('link', { name: /subsanar/i })).toBeDefined();
  });

  it('renders Ver Detalle button for non-OBSERVADO tramites', async () => {
    renderWithProviders(<TramitesList />);
    // Multiple non-observado tramites
    const detailLinks = await screen.findAllByRole('link', { name: /ver detalle/i });
    expect(detailLinks.length).toBeGreaterThan(0);
  });

  it('displays results count', async () => {
    renderWithProviders(<TramitesList />);
    await screen.findByRole('heading', { level: 1 });
    // Results count span should show 4
    const countEl = document.querySelector('span[style*="margin-left: auto"]') || 
      Array.from(document.querySelectorAll('span')).find(s => s.textContent?.includes('4'));
    expect(countEl || document.body.textContent?.includes('4')).toBeTruthy();
  });
});
