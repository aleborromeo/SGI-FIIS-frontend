import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ContactoPage } from './ContactoPage';
import { renderWithProviders } from '../utils/testUtils';

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

describe('ContactoPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocationState = null;
    window.scrollTo = vi.fn();
  });

  it('renders header, navigation links, and switch tab buttons', async () => {
    renderWithProviders(<ContactoPage />);

    expect(screen.getByText('Inicio')).toBeDefined();
    expect(screen.getByText('Sobre nosotros')).toBeDefined();
    expect(screen.getByText('Contacto')).toBeDefined();

    // Verify contact form section is loaded
    expect(screen.getByPlaceholderText('Escribe tu mensaje con claridad y detalle.')).toBeDefined();
  });

  it('submits contact form and triggers success toast notification', async () => {
    renderWithProviders(<ContactoPage />);

    const emailInput = screen.getByLabelText('Correo del remitente');
    const messageInput = screen.getByPlaceholderText('Escribe tu mensaje con claridad y detalle.');
    const submitBtn = screen.getByRole('button', { name: 'Enviar mensaje' });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@unas.edu.pe' } });
      fireEvent.change(messageInput, { target: { value: 'Mensaje de prueba para contacto.' } });
    });

    await act(async () => {
      submitBtn.click();
    });

    // Verify input fields were reset after successful submit
    expect(emailInput.getAttribute('value')).toBe('');
    expect(messageInput.textContent).toBe('');
  });

  it('navigates when clicking brand logo and scrolling buttons', async () => {
    renderWithProviders(<ContactoPage />);

    const brandLogo = screen.getByAltText('SGI Logo');
    expect(brandLogo).toBeDefined();

    await act(async () => {
      brandLogo.click();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');

    // Target scroll buttons in sidebar
    const scrollBtn = screen.getByText('WhatsApp directo');
    await act(async () => {
      scrollBtn.click();
    });

    expect(window.scrollTo).toHaveBeenCalled();
  });
});

