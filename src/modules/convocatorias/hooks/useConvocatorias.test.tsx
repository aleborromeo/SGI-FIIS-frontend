import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConvocatorias } from './useConvocatorias';
import { convocatoriaService } from '../services/convocatoria.service';

vi.mock('../services/convocatoria.service', () => ({
  convocatoriaService: {
    getActivas: vi.fn(),
  },
}));

const mockConvocatoriaService = vi.mocked(convocatoriaService);

describe('useConvocatorias hook', () => {
  it('fetches convocatorias using convocatoriaService', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockConvocatoriaService.getActivas.mockResolvedValue([
      { id: 1, title: 'Call 1', status: 'ABIERTA', description: 'Desc 1', startDate: '2026-01-01', endDate: '2026-02-01', targetAudience: 'AMBOS', researchLineIds: [] }
    ]);

    const { result } = renderHook(() => useConvocatorias(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe('Call 1');
  });
});
