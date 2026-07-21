import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ConvocatoriaCard } from './ConvocatoriaCard';
import type { Convocatoria } from '../types/convocatoria.types';

vi.mock('react-i18next', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

describe('ConvocatoriaCard', () => {
  const mockConvocatoria: Convocatoria = {
    id: 101,
    title: 'Proyecto de Investigacion FIIS',
    description: 'Estudio de modelos predictivos avanzados en IA.',
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    status: 'ABIERTA',
    targetAudience: 'DOCENTES',
    researchLineIds: [1],
  };

  it('renders convocatoria details correctly when eligible and clicks apply', async () => {
    const handlePostular = vi.fn();
    render(
      <ConvocatoriaCard
        convocatoria={mockConvocatoria}
        eligible={true}
        onPostular={handlePostular}
      />
    );

    expect(screen.getByText('CONV-101')).toBeDefined();
    expect(screen.getByText('Proyecto de Investigacion FIIS')).toBeDefined();
    expect(screen.getByText('Estudio de modelos predictivos avanzados en IA.')).toBeDefined();
    expect(screen.getByText('2026-05-01')).toBeDefined();
    expect(screen.getByText('2026-10-31')).toBeDefined();

    // Click on Apply button
    const applyButton = screen.getByRole('button', { name: 'dashboard.card.applyButton' });
    expect(applyButton).toBeDefined();
    expect(applyButton.hasAttribute('disabled')).toBe(false);

    await act(async () => {
      applyButton.click();
    });
    expect(handlePostular).toHaveBeenCalledWith(mockConvocatoria);
  });

  it('disables apply button and shows tooltip if not eligible', () => {
    render(
      <ConvocatoriaCard
        convocatoria={mockConvocatoria}
        eligible={false}
        onPostular={vi.fn()}
      />
    );

    const applyButton = screen.getByRole('button', { name: 'dashboard.card.applyButton' });
    expect(applyButton).toBeDefined();
    expect(applyButton.hasAttribute('disabled')).toBe(true);
  });
});
