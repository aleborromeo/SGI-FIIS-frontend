import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent, waitFor } from '@testing-library/react';
import { SobreSgiPage } from './SobreSgiPage';
import { renderWithProviders } from '../utils/testUtils';
import { researchService } from '../services/researchService';

vi.mock('../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
    getGroupLines: vi.fn(),
    getGroupByUser: vi.fn(),
  },
}));

const mockResearchService = vi.mocked(researchService);

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

describe('SobreSgiPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocationState = null;
    window.scrollTo = vi.fn();
    mockResearchService.getLines.mockResolvedValue([
      { id: 1, lineName: 'Computación', active: true },
      { id: 2, lineName: 'Ingeniería de Software', active: true },
      { id: 3, lineName: 'Inteligencia Artificial', active: true },
    ]);
    mockResearchService.getGroups.mockResolvedValue([
      { id: 1, groupCode: 'GINSOFT', groupName: 'Grupo de Investigación en Ingeniería de Software', active: true },
      { id: 2, groupCode: 'RESEGTI', groupName: 'Red de Seguridad y Gestión de TI', active: true },
    ]);
    mockResearchService.getGroupLines.mockResolvedValue([]);
  });

  it('renders side menu and default section (quienes-somos)', async () => {
    renderWithProviders(<SobreSgiPage />);

    expect(screen.getAllByText('Quiénes somos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Líneas de investigación').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Grupos de investigación').length).toBeGreaterThan(0);

    // Verify main content of 'quienes-somos' is rendered
    expect(screen.getByText('Dónde comenzó todo')).toBeDefined();
  });

  it('switches sections when sidebar links are clicked', async () => {
    renderWithProviders(<SobreSgiPage />);

    // Click "Líneas de investigación" link
    const linesLink = screen.getAllByRole('link', { name: 'Líneas de investigación' });
    expect(linesLink.length).toBeGreaterThan(0);
    await act(async () => {
      linesLink[linesLink.length - 1].click(); // target sidebar link
    });

    // Content should update
    expect(screen.getByText('Computación')).toBeDefined();
    expect(screen.getByText('Ingeniería de Software')).toBeDefined();

    // Click "Grupos de investigación" link
    const groupsLink = screen.getAllByRole('link', { name: 'Grupos de investigación' });
    expect(groupsLink.length).toBeGreaterThan(0);
    await act(async () => {
      groupsLink[groupsLink.length - 1].click();
    });

    // Content should update
    expect(screen.getByText('GINSOFT')).toBeDefined();
    expect(screen.getByText('RESEGTI')).toBeDefined();
  });

  it('handles external navigation and updates active section', async () => {
    mockLocationState = { scrollToHash: 'grupos-investigacion' };
    renderWithProviders(<SobreSgiPage />);

    expect(await screen.findByText('GINSOFT')).toBeDefined();
  });

  it('navigates when clicking header and footer links', async () => {
    renderWithProviders(<SobreSgiPage />);

    // Click navigation links
    const homeLink = screen.getByRole('link', { name: 'Inicio' });
    await act(async () => {
      homeLink.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Click news link
    const newsLink = screen.getByText('Novedades');
    await act(async () => {
      newsLink.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades');

    // Click contact link
    const contactLink = screen.getByText('Contacto');
    await act(async () => {
      contactLink.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/contacto');

    // Click login button
    const loginBtn = screen.getByRole('button', { name: 'Iniciar sesión' });
    await act(async () => {
      loginBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    // Click submit research button
    const submitBtn = screen.getByText('Envía tu investigación');
    await act(async () => {
      submitBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('scrolls to top when clicking back-to-top button in footer', async () => {
    renderWithProviders(<SobreSgiPage />);

    const scrollBtn = screen.getByTitle('Volver arriba');
    await act(async () => {
      scrollBtn.click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('handles sidebar link transitions and scrolls to top', async () => {
    renderWithProviders(<SobreSgiPage />);

    const sidebarLinesLink = screen.getAllByRole('link', { name: 'Líneas de investigación' });
    await act(async () => {
      sidebarLinesLink[sidebarLinesLink.length - 1].click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Click "Quiénes somos" sidebar link
    const sidebarWhoLink = screen.getAllByRole('link', { name: 'Quiénes somos' });
    await act(async () => {
      sidebarWhoLink[sidebarWhoLink.length - 1].click();
    });

    // Click footer preventDefault links
    const manualLink = screen.getByText('Manual de Usuario');
    await act(async () => {
      manualLink.click();
    });

    const privacyLink = screen.getByText('Política de Privacidad');
    await act(async () => {
      privacyLink.click();
    });

    const termsLink = screen.getByText('Términos de Uso');
    await act(async () => {
      termsLink.click();
    });
  });

  it('handles dropdown sub-menu redirect clicks', async () => {
    renderWithProviders(<SobreSgiPage />);

    // Novedades sub-items
    const announcementItem = screen.getByText('Anuncios');
    await act(async () => {
      announcementItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-convocatorias' } });

    const recognitionItem = screen.getByText('Reconocimiento');
    await act(async () => {
      recognitionItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-reconocimientos' } });

    const congressItem = screen.getByText('Congresos');
    await act(async () => {
      congressItem.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/novedades', { state: { scrollToHash: 'novedades-congresos' } });

    // Contacto sub-items
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

    // Sobre nosotros sub-items (sets activeSection instead of navigating)
    const whoItems = screen.getAllByText('Quiénes somos');
    await act(async () => {
      whoItems[whoItems.length - 2].click(); // target dropdown item
    });

    const linesItems = screen.getAllByText('Líneas de investigación');
    await act(async () => {
      linesItems[linesItems.length - 2].click();
    });

    const groupsItems = screen.getAllByText('Grupos de investigación');
    await act(async () => {
      groupsItems[groupsItems.length - 2].click();
    });
  });
});

