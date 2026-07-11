import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EligibilityGate } from './EligibilityGate';
import { useEligibility } from '../hooks/useEligibility';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../hooks/useEligibility', () => ({
  useEligibility: vi.fn(),
}));

vi.mock('../hooks/useConvocatorias', () => ({
  useConvocatorias: vi.fn(),
}));

const mockUseEligibility = vi.mocked(useEligibility);
const mockUseConvocatorias = vi.mocked(useConvocatorias);

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('EligibilityGate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state', () => {
    mockUseEligibility.mockReturnValue({ data: undefined, isLoading: true } as any);
    mockUseConvocatorias.mockReturnValue({ data: undefined, isLoading: true } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('Verificando requisitos...')).toBeDefined();
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('blocks access when user has no active group', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: false, hasVigentCalls: true, docente: true, valid: false },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [{ id: 1, title: 'Call 1' }],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('No habilitado para postular')).toBeDefined();
    expect(screen.getByText(/No pertenece a un grupo de investigación activo/)).toBeDefined();
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('blocks access when there are no open convocatorias', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: true, hasVigentCalls: false, docente: true, valid: false },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('No habilitado para postular')).toBeDefined();
    expect(screen.getByText(/No existen convocatorias abiertas/)).toBeDefined();
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('blocks access when both conditions fail', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: false, hasVigentCalls: false, docente: true, valid: false },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText(/No pertenece a un grupo/)).toBeDefined();
    expect(screen.getByText(/No existen convocatorias/)).toBeDefined();
  });

  it('renders children when all conditions are met', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: true, hasVigentCalls: true, docente: true, valid: true },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [{ id: 1, title: 'Call 1' }],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('Child content')).toBeDefined();
    expect(screen.queryByText('No habilitado para postular')).toBeNull();
  });

  it('shows loading when only eligibility is loading', () => {
    mockUseEligibility.mockReturnValue({ data: undefined, isLoading: true } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('Verificando requisitos...')).toBeDefined();
  });

  it('shows loading when only convocatorias is loading', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: true },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({ data: undefined, isLoading: true } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>
    );

    expect(screen.getByText('Verificando requisitos...')).toBeDefined();
  });
});
