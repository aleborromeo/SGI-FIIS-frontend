import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act } from '@testing-library/react';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { renderWithProviders } from '../utils/testUtils';

const mockNavigate = vi.fn();
let mockLocationSearch = '';
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      search: mockLocationSearch,
    }),
  };
});

describe('PrivacyPolicyPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocationSearch = '';
    window.scrollTo = vi.fn();
  });

  it('renders default section (privacidad) when search is empty', async () => {
    renderWithProviders(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Política de privacidad' })).toBeDefined();
    // Check key text in privacy section
    expect(screen.getByText(/La Facultad de Ingeniería en Informática y Sistemas/i)).toBeDefined();
  });

  it('renders terminos section when search tab is terminos', async () => {
    mockLocationSearch = '?tab=terminos';
    renderWithProviders(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Términos y condiciones de uso' })).toBeDefined();
    expect(screen.getByText(/Aceptación de los términos/i)).toBeDefined();
  });

  it('switches tabs and navigates correctly when sidebar links are clicked', async () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // Click "Términos y condiciones"
    const termsBtn = screen.getByRole('button', { name: 'Términos y condiciones' });
    await act(async () => {
      termsBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/privacy-policy?tab=terminos', { replace: true });
    expect(screen.getByRole('heading', { name: 'Términos y condiciones de uso' })).toBeDefined();

    // Click "Declaración de derechos de autor"
    const copyrightBtn = screen.getByRole('button', { name: 'Declaración de derechos de autor' });
    await act(async () => {
      copyrightBtn.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/privacy-policy', { replace: true });
    expect(screen.getByRole('heading', { name: 'Declaración de derechos de autor' })).toBeDefined();

    // Click "Política de cookies"
    const cookiesBtn = screen.getByRole('button', { name: 'Política de cookies' });
    await act(async () => {
      cookiesBtn.click();
    });
    expect(screen.getByRole('heading', { name: 'Política de cookies' })).toBeDefined();

    // Click "Resumen de cambios"
    const changesBtn = screen.getByRole('button', { name: 'Resumen de cambios' });
    await act(async () => {
      changesBtn.click();
    });
    expect(screen.getByRole('heading', { name: 'Resumen de cambios legales' })).toBeDefined();

    // Click "Términos de eventos"
    const eventsBtn = screen.getByRole('button', { name: 'Términos de eventos' });
    await act(async () => {
      eventsBtn.click();
    });
    expect(screen.getByRole('heading', { name: 'Términos y condiciones de eventos' })).toBeDefined();

    // Click "Política de privacidad" to return to original tab
    const privacyBtn = screen.getByRole('button', { name: 'Política de privacidad' });
    await act(async () => {
      privacyBtn.click();
    });
    expect(screen.getByRole('heading', { name: 'Política de privacidad' })).toBeDefined();
  });

  it('navigates home when clicking header logo', async () => {
    renderWithProviders(<PrivacyPolicyPage />);

    const logo = screen.getByAltText('SGI Logo');
    await act(async () => {
      logo.click();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('switches tabs when footer links are clicked', async () => {
    renderWithProviders(<PrivacyPolicyPage />);

    // Target the specific footer texts
    const footerTerms = screen.getByText('Términos y condiciones', { selector: '.privacy-footer-link' });
    await act(async () => {
      footerTerms.click();
    });
    expect(screen.getByRole('heading', { name: 'Términos y condiciones de uso' })).toBeDefined();

    const footerPrivacy = screen.getByText('Política de privacidad', { selector: '.privacy-footer-link' });
    await act(async () => {
      footerPrivacy.click();
    });
    expect(screen.getByRole('heading', { name: 'Política de privacidad' })).toBeDefined();
  });

  it('triggers window.scrollTo on activeTab change', async () => {
    renderWithProviders(<PrivacyPolicyPage />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});

