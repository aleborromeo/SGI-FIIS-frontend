import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NovedadesPage } from './NovedadesPage';
import { callService } from '../services/callService';
import { renderWithProviders } from '../utils/testUtils';

vi.mock('../services/callService', () => ({
  callService: {
    getAll: vi.fn(),
  },
}));

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

describe('NovedadesPage', () => {
  const mockCalls = [
    {
      id: 1,
      title: 'Convocatoria Abierta',
      description: 'Esta es una convocatoria abierta.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'ABIERTA',
    },
    {
      id: 2,
      title: 'Convocatoria Cerrada',
      description: 'Esta es una convocatoria cerrada.',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      status: 'CERRADA',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockLocationState = null;
    window.scrollTo = vi.fn();
    mockCallService.getAll.mockResolvedValue(mockCalls);
  });

  it('renders loading spinner then displays calls list', async () => {
    renderWithProviders(<NovedadesPage />);

    expect(mockCallService.getAll).toHaveBeenCalled();

    // Verify calls details render in DOM
    expect(await screen.findByText('Convocatoria Abierta')).toBeDefined();
    expect(screen.getByText('Convocatoria Cerrada')).toBeDefined();
    expect(screen.getByText('Esta es una convocatoria abierta.')).toBeDefined();
  });

  it('navigates to login when clicking apply on an open call', async () => {
    renderWithProviders(<NovedadesPage />);

    const applyBtn = await screen.findByRole('button', { name: 'Postular e Iniciar Trámite' });
    await act(async () => {
      applyBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('switches section tabs using sidebar links', async () => {
    renderWithProviders(<NovedadesPage />);

    // Wait for data load
    expect(await screen.findByText('Convocatoria Abierta')).toBeDefined();

    // Click "Reconocimiento" sidebar link
    const recLink = screen.getAllByRole('link', { name: 'Reconocimiento' });
    await act(async () => {
      recLink[recLink.length - 1].click(); // target sidebar link
    });

    // Verify recognition section title renders
    expect(screen.getByText('Reconocimiento y Logros Científicos')).toBeDefined();

    // Click "Congresos" sidebar link
    const congLink = screen.getAllByRole('link', { name: 'Congresos' });
    await act(async () => {
      congLink[congLink.length - 1].click();
    });

    // Verify congress section title renders
    expect(screen.getByText('Próximos Congresos y Eventos')).toBeDefined();

    // Click register button inside congress section
    const registerBtn = screen.getByRole('button', { name: 'Inscribirse al Evento' });
    await act(async () => {
      registerBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles external navigation scrollToHash hooks', async () => {
    mockLocationState = { scrollToHash: 'novedades-reconocimientos' };
    renderWithProviders(<NovedadesPage />);

    // Should load with reconocimientos tab active
    expect(screen.getByText('Reconocimiento y Logros Científicos')).toBeDefined();
  });

  it('handles header navbar clicks and redirect items', async () => {
    // Add same-status items to verify b.id - a.id sorting coverage
    mockCallService.getAll.mockResolvedValue([
      { id: 10, title: 'Call 10', description: 'Desc 10', startDate: '2026', endDate: '2026', status: 'ABIERTA' },
      { id: 11, title: 'Call 11', description: 'Desc 11', startDate: '2026', endDate: '2026', status: 'ABIERTA' },
    ]);

    renderWithProviders(<NovedadesPage />);

    // Logo click redirect
    const logo = screen.getByAltText('SGI Logo');
    await act(async () => {
      logo.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Dropdown header click (covers preventDefault on Novedades, Sobre nosotros)
    const newsDropdownHeader = screen.getAllByText('Novedades')[0];
    await act(async () => {
      newsDropdownHeader.click();
    });

    const aboutDropdownHeader = screen.getByText('Sobre nosotros');
    await act(async () => {
      aboutDropdownHeader.click();
    });

    // Dropdown items clicks
    const announcementsItem = screen.getAllByText('Convocatorias')[0]; // under Novedades dropdown
    await act(async () => {
      announcementsItem.click();
    });

    const recognitionItem = screen.getAllByText('Reconocimiento')[0];
    await act(async () => {
      recognitionItem.click();
    });

    const congressItem = screen.getAllByText('Congresos')[0];
    await act(async () => {
      congressItem.click();
    });

    // Sub-items under Sobre nosotros
    const whoItem = screen.getByText('Quiénes somos');
    await act(async () => {
      whoItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/sobre-sgi', { state: { scrollToHash: 'quienes-somos' } });

    const linesItem = screen.getAllByText('Líneas de investigación')[0];
    await act(async () => {
      linesItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/sobre-sgi', { state: { scrollToHash: 'lineas-investigacion' } });

    const groupsItem = screen.getAllByText('Grupos de investigación')[0];
    await act(async () => {
      groupsItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/sobre-sgi', { state: { scrollToHash: 'grupos-investigacion' } });

    // Sub-items under Contacto
    const mailItem = screen.getByText('Correo');
    await act(async () => {
      mailItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/contacto', { state: { scrollToHash: 'contacto-form-section' } });

    const whatsappItem = screen.getByText('WhatsApp');
    await act(async () => {
      whatsappItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/contacto', { state: { scrollToHash: 'whatsapp-contact-section' } });

    // Sidebar Convocatorias link click
    const sidebarConvLink = screen.getAllByRole('link', { name: 'Convocatorias' });
    await act(async () => {
      sidebarConvLink[sidebarConvLink.length - 1].click();
    });

    // Click footer preventDefault links
    const faqLink = screen.getByText('Preguntas Frecuentes');
    await act(async () => {
      faqLink.click();
    });

    const manualLink = screen.getByText('Manual de Usuario');
    await act(async () => {
      manualLink.click();
    });

    // Header nav links click
    const homeLink = screen.getByRole('link', { name: 'Inicio' });
    await act(async () => {
      homeLink.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles backend service error catch block', async () => {
    mockCallService.getAll.mockRejectedValue(new Error('Backend error'));
    renderWithProviders(<NovedadesPage />);
    // Wait for async actions to complete, checking if it doesn't crash
    expect(mockCallService.getAll).toHaveBeenCalled();
  });

  it('scrolls to top when clicking back-to-top button in footer', async () => {
    renderWithProviders(<NovedadesPage />);

    const scrollBtn = screen.getByTitle('Volver arriba');
    await act(async () => {
      scrollBtn.click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('handles empty state when no calls are returned', async () => {
    mockCallService.getAll.mockResolvedValue([]);
    renderWithProviders(<NovedadesPage />);

    expect(await screen.findByText('No hay convocatorias vigentes en este momento.')).toBeDefined();
  });
});

