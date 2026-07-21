import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEligibility } from './useEligibility';
import { convocatoriaService } from '../services/convocatoria.service';

vi.mock('../services/convocatoria.service', () => ({
  convocatoriaService: {
    checkEligibility: vi.fn().mockResolvedValue({ valid: true }),
  },
}));

function wrapper({ children }: { children: any }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

describe('useEligibility', () => {
  it('invoca convocatoriaService.checkEligibility', async () => {
    renderHook(() => useEligibility(), { wrapper });
    await waitFor(() => {
      expect(convocatoriaService.checkEligibility).toHaveBeenCalled();
    });
  });

  it('expone el estado de la query', async () => {
    const { result } = renderHook(() => useEligibility(), { wrapper });
    await waitFor(() => {
      expect(result.current.data).toEqual({ valid: true });
    });
  });
});
