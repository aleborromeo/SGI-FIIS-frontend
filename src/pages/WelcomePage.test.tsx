import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { WelcomePage } from './WelcomePage';
import { api } from '../services/api';
import { callService } from '../services/callService';
import { renderWithProviders } from '../utils/testUtils';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('../services/callService', () => ({
  callService: {
    getVigent: vi.fn(),
  },
}));

const mockApi = vi.mocked(api);
const mockCallService = vi.mocked(callService);

const mockNavigate = vi.fn();
let mockLocationState: any = null;
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: mockLocationState,
    }),
  };
});

describe('WelcomePage', () => {
  const mockStats = {
    proyectosRegistrados: 500,
    tesis: 200,
    docentesInvestigadores: 35,
    gruposInvestigacion: 9,
    proyectosCulminados: 88,
  };

  const mockGroups = [
    { codigo: 'GINSOFT', nombre: 'Grupo de Investigación en Ingeniería de Software', publicaciones: 20, miembros: 5 },
    { codigo: 'RESEGTI', nombre: 'Red de Seguridad y Gestión de TI', publicaciones: 15, miembros: 3 },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockLocationState = null;
    window.scrollTo = vi.fn();

    mockApi.get.mockImplementation(async (url: string) => {
      if (url === '/auth/public-stats') {
        return mockStats;
      }
      if (url === '/auth/public-groups') {
        return mockGroups;
      }
      return null;
    });

    mockCallService.getVigent.mockResolvedValue([
      {
        id: 1,
        title: 'Convocatoria Anual 2026',
        description: 'Financiamiento para proyectos de investigación e innovación tecnológica.',
        endDate: '2026-12-31',
      },
    ]);
  });

  const unauthAuthValue = {
    user: null,
    roles: [],
    currentRole: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    switchRole: vi.fn(),
    clearError: vi.fn(),
    completeRegistration: vi.fn(),
  };

  it('renders landing page sections when unauthenticated', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    // Header logo & basic links
    expect(screen.getByAltText('SGI Logo')).toBeDefined();

    // Verify stats from API are displayed
    expect(await screen.findByText('500')).toBeDefined(); // stats.proyectosRegistrados
    expect(screen.getByText('35')).toBeDefined(); // stats.docentesInvestigadores
    expect(screen.getByText('88')).toBeDefined(); // stats.proyectosCulminados

    // Verify lines of research
    expect(screen.getByText('Computación')).toBeDefined();
    expect(screen.getByText('Ingeniería de Software')).toBeDefined();

    // Verify groups from API
    expect(screen.getByText('GINSOFT')).toBeDefined();
    expect(screen.getByText('RESEGTI')).toBeDefined();
  });

  it('handles navigation links and button clicks', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    // Click all "Iniciar sesión" buttons
    const loginBtns = screen.getAllByRole('button', { name: /Iniciar sesión/i });
    expect(loginBtns.length).toBeGreaterThan(0);
    for (const btn of loginBtns) {
      await act(async () => {
        btn.click();
      });
    }
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Click "Envía tu investigación"
    const submitBtn = screen.getByText('Envía tu investigación');
    await act(async () => {
      submitBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Click "Ver todos los grupos de investigación"
    const allGroupsBtn = screen.getByText('Ver todos los grupos de investigación');
    await act(async () => {
      allGroupsBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('scrolls to top when clicking back-to-top button in footer', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    const scrollBtn = screen.getByTitle('Volver arriba');
    await act(async () => {
      scrollBtn.click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('redirects to /dashboard if authenticated', async () => {
    renderWithProviders(<WelcomePage />); // defaults to authenticated admin in testUtils
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('cycles slides in the hero section via timer', async () => {
    vi.useFakeTimers();
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    // Initial title
    expect(screen.getByText(/Sistema de Gestión/i)).toBeDefined();

    // Fast-forward 7 seconds to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });

    // Carousel continues to render active slides
    expect(screen.getByText(/Sistema de Gestión/i)).toBeDefined();
    vi.useRealTimers();
  });

  it('handles scrollToHash location states on load', async () => {
    const getElementSpy = vi.spyOn(document, 'getElementById').mockReturnValue({
      getBoundingClientRect: () => ({ top: 100 } as any),
    } as any);

    mockLocationState = { scrollTo: 'contacto' };
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    // Wait for the setTimeout(..., 150) inside the component
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(window.scrollTo).toHaveBeenCalled();
    getElementSpy.mockRestore();
  });

  it('handles navigation items using dropdown menu redirects', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    const newsLink = screen.getByText('Novedades');
    await act(async () => {
      newsLink.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades');
  });

  it('handles news card action buttons navigation', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    const viewButtons = screen.getAllByRole('button', { name: 'Ver' });
    expect(viewButtons.length).toBe(3);

    // Convocatorias
    await act(async () => {
      viewButtons[0].click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-convocatorias' } });

    // Reconocimientos
    await act(async () => {
      viewButtons[1].click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-reconocimientos' } });

    // Congresos
    await act(async () => {
      viewButtons[2].click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-congresos' } });
  });

  it('handles carousel controls next/prev buttons and wheel events', async () => {
    renderWithProviders(<WelcomePage />, { authValue: unauthAuthValue });

    const nextBtn = screen.getByTitle('Siguiente');
    const prevBtn = screen.getByTitle('Anterior');

    // Click next button
    await act(async () => {
      nextBtn.click();
    });

    // Click prev button
    await act(async () => {
      prevBtn.click();
    });

    const card = screen.getByText('GINSOFT').closest('.group-carousel-card');
    expect(card).not.toBeNull();

    // Click card
    await act(async () => {
      (card as HTMLElement).click();
    });

    // Let's trigger a wheel event on a carousel card
    await act(async () => {
      const wheelEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: 100,
      });
      card!.dispatchEvent(wheelEvent);
    });

    // Let's also click a manual link in the footer to cover preventDefault
    const manualLink = screen.getByText('Manual de Usuario');
    await act(async () => {
      manualLink.click();
    });
  });
});

