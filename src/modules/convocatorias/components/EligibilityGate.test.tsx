import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EligibilityGate } from './EligibilityGate';
import { AuthContext } from '../../../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConvocatorias } from '../hooks/useConvocatorias';
import { useEligibility } from '../hooks/useEligibility';

vi.mock('../hooks/useEligibility', () => ({
  useEligibility: vi.fn(),
}));

vi.mock('../hooks/useConvocatorias', () => ({
  useConvocatorias: vi.fn(),
}));

const mockUseEligibility = vi.mocked(useEligibility);
const mockUseConvocatorias = vi.mocked(useConvocatorias);

function renderWithQuery(ui: React.ReactElement, currentRole: string = 'DOCENTE_INVESTIGADOR') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const mockAuthContext = {
    isAuthenticated: true,
    user: { id: 1 },
    roles: [currentRole],
    currentRole,
    loading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={mockAuthContext}>
        {ui}
      </AuthContext.Provider>
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

  it('renders children when user is ESTUDIANTE even if docente is false', () => {
    mockUseEligibility.mockReturnValue({
      data: { hasActiveGroup: true, hasVigentCalls: true, docente: false, valid: false },
      isLoading: false,
    } as any);
    mockUseConvocatorias.mockReturnValue({
      data: [{ id: 1, title: 'Call 1' }],
      isLoading: false,
    } as any);

    renderWithQuery(
      <EligibilityGate>
        <div>Child content</div>
      </EligibilityGate>,
      'ESTUDIANTE'
    );

    expect(screen.getByText('Child content')).toBeDefined();
    expect(screen.queryByText('No habilitado para postular')).toBeNull();
  });
});
