import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConvocatorias } from './useConvocatorias';
import { convocatoriaService } from '../services/convocatoria.service';

vi.mock('../services/convocatoria.service', () => ({
  convocatoriaService: {
    getActivas: vi.fn().mockResolvedValue([{ id: 1, title: 'C' }]),
  },
}));

function wrapper({ children }: { children: any }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useConvocatorias', () => {
  it('invoca convocatoriaService.getActivas', async () => {
    renderHook(() => useConvocatorias(), { wrapper });
    await waitFor(() => {
      expect(convocatoriaService.getActivas).toHaveBeenCalled();
    });
  });

  it('expone el estado de la query', async () => {
    const { result } = renderHook(() => useConvocatorias(), { wrapper });
    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, title: 'C' }]);
    });
  });
});
