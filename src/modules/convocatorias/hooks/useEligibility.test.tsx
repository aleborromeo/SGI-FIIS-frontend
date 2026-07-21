import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEligibility } from './useEligibility';
import { convocatoriaService } from '../services/convocatoria.service';

vi.mock('../services/convocatoria.service', () => ({
  convocatoriaService: {
    checkEligibility: vi.fn(),
  },
}));

const mockConvocatoriaService = vi.mocked(convocatoriaService);

describe('useEligibility hook', () => {
  it('fetches eligibility data using convocatoriaService', async () => {
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

    mockConvocatoriaService.checkEligibility.mockResolvedValue({
      eligible: true,
      code: 'OK',
    } as any);

    const { result } = renderHook(() => useEligibility(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.eligible).toBe(true);
  });
});
