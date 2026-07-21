import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomePage } from './WelcomePage';

const { mockGetVigent, mockApiGet } = vi.hoisted(() => ({
  mockGetVigent: vi.fn(),
  mockApiGet: vi.fn(),
}));

vi.mock('../services/callService', () => ({
  callService: { getVigent: mockGetVigent },
}));
vi.mock('../services/api', () => ({
  api: { get: mockApiGet },
}));
vi.mock('../context/AuthContext', () => {
  const AuthContextMock = React.createContext({ isAuthenticated: false });
  return {
    AuthContext: AuthContextMock,
    AuthProvider: ({ children }: any) => children,
  };
});

beforeAll(() => {
  window.scrollTo = vi.fn() as any;
});

const renderWithProviders = () =>
  render(
    <MemoryRouter>
      <WelcomePage />
    </MemoryRouter>
  );

describe('WelcomePage (public landing)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetVigent.mockResolvedValue([]);
    mockApiGet.mockImplementation((url: string) =>
      url.includes('public-stats')
        ? Promise.resolve({ proyectosRegistrados: 320 })
        : Promise.resolve([])
    );
  });

  it('renders the public landing navigation and research section', async () => {
    renderWithProviders();
    expect((await screen.findAllByText('Iniciar sesión')).length).toBeGreaterThan(0);
    expect(screen.getByText('Explora nuestras líneas de investigación')).toBeDefined();
  });

  it('fetches public stats, groups and active calls on mount', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/auth/public-stats');
    });
    expect(mockApiGet).toHaveBeenCalledWith('/auth/public-groups');
    expect(mockGetVigent).toHaveBeenCalled();
  });

  it('renders the six research line cards', async () => {
    const { container } = renderWithProviders();
    await screen.findByText('Explora nuestras líneas de investigación');
    expect(container.querySelectorAll('.line-card').length).toBe(6);
  });
});
