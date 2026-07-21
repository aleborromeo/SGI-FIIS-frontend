import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConvocatoriasDashboard } from './ConvocatoriasDashboard';
import { AuthContext } from '../../../context/AuthContext';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useEligibility } from '../hooks/useEligibility';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useConvocatorias', () => ({
  useConvocatorias: vi.fn(),
}));

vi.mock('../hooks/useEligibility', () => ({
  useEligibility: vi.fn(),
}));

const mockUseConvocatorias = vi.mocked(useConvocatorias);
const mockUseEligibility = vi.mocked(useEligibility);

describe('ConvocatoriasDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderComponent = (currentRole: string | null) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ currentRole } as any}>
          <MemoryRouter>
            <ConvocatoriasDashboard />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders null if role is not DOCENTE_INVESTIGADOR or ESTUDIANTE', () => {
    mockUseConvocatorias.mockReturnValue({ data: [], isLoading: false } as any);
    mockUseEligibility.mockReturnValue({ data: { valid: true }, isLoading: false } as any);

    const { container } = renderComponent('ADMIN');
    expect(container.firstChild).toBeNull();
  });

  it('renders skeleton when loading', () => {
    mockUseConvocatorias.mockReturnValue({ data: undefined, isLoading: true } as any);
    mockUseEligibility.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { container } = renderComponent('ESTUDIANTE');
    // Check skeleton elements are rendered
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('renders alert when error occurs', () => {
    mockUseConvocatorias.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Network error') } as any);
    mockUseEligibility.mockReturnValue({ data: { hasActiveGroup: true }, isLoading: false } as any);

    renderComponent('ESTUDIANTE');

    expect(screen.getByText('dashboard.title')).toBeDefined();
    expect(screen.getByText('dashboard.errorTitle')).toBeDefined();
    expect(screen.getByText('dashboard.errorMessage')).toBeDefined();
  });

  it('renders empty component when no convocatorias are active', () => {
    mockUseConvocatorias.mockReturnValue({ data: [], isLoading: false } as any);
    mockUseEligibility.mockReturnValue({ data: { hasActiveGroup: true, hasVigentCalls: true }, isLoading: false } as any);

    renderComponent('ESTUDIANTE');

    expect(screen.getByText('No existen convocatorias activas')).toBeDefined();
  });

  it('renders list of cards when data is loaded successfully', async () => {
    const mockCalls = [
      {
        id: 1,
        title: 'Call One',
        description: 'First active call description',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        targetAudience: 'AMBOS',
        researchLineIds: [1],
      },
    ];
    mockUseConvocatorias.mockReturnValue({ data: mockCalls, isLoading: false } as any);
    mockUseEligibility.mockReturnValue({ data: { hasActiveGroup: true, valid: true }, isLoading: false } as any);

    renderComponent('DOCENTE_INVESTIGADOR');

    expect(screen.getByText('Call One')).toBeDefined();
    expect(screen.getByText('First active call description')).toBeDefined();

    const applyButton = screen.getByRole('button', { name: 'dashboard.card.applyButton' });
    await act(async () => {
      applyButton.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/projects/new?callId=1');
  });
});
