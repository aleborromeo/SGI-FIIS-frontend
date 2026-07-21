import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../hooks/useLanguage';

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUseLanguage = vi.mocked(useLanguage);

describe('LanguageSwitcher', () => {
  const mockSetLanguage = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseLanguage.mockReturnValue({
      language: 'es',
      setLanguage: mockSetLanguage,
      toggleLanguage: vi.fn(),
    });
  });

  describe('select variant (default)', () => {
    it('renders as select element and responds to change events', () => {
      render(<LanguageSwitcher variant="select" />);

      const select = screen.getByRole('combobox', { name: 'language' }) as HTMLSelectElement;
      expect(select).toBeDefined();
      expect(select.value).toBe('es');

      fireEvent.change(select, { target: { value: 'en' } });
      expect(mockSetLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('button variant', () => {
    it('renders button, toggles dropdown menu on click, and handles language change', async () => {
      render(<LanguageSwitcher variant="button" />);

      // Trigger button
      const triggerButton = screen.getByRole('button', { name: 'language' });
      expect(triggerButton).toBeDefined();
      expect(screen.queryByRole('menu')).toBeNull();

      // Click to open menu
      await act(async () => {
        triggerButton.click();
      });

      expect(screen.getByRole('menu')).toBeDefined();
      
      const esOption = screen.getByRole('menuitemradio', { name: 'spanishES' });
      const enOption = screen.getByRole('menuitemradio', { name: 'englishEN' });

      expect(esOption).toBeDefined();
      expect(enOption).toBeDefined();

      // Click EN option
      await act(async () => {
        enOption.click();
      });

      expect(mockSetLanguage).toHaveBeenCalledWith('en');
      expect(screen.queryByRole('menu')).toBeNull(); // Menu closes on option click
    });

    it('closes menu on click outside', async () => {
      render(
        <div>
          <button data-testid="outside-btn">Outside</button>
          <LanguageSwitcher variant="button" />
        </div>
      );

      const triggerButton = screen.getByRole('button', { name: 'language' });

      // Open menu
      await act(async () => {
        triggerButton.click();
      });
      expect(screen.getByRole('menu')).toBeDefined();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside-btn'));
      expect(screen.queryByRole('menu')).toBeNull();
    });

    it('closes menu on Escape key down', async () => {
      render(<LanguageSwitcher variant="button" />);

      const triggerButton = screen.getByRole('button', { name: 'language' });

      // Open menu
      await act(async () => {
        triggerButton.click();
      });
      expect(screen.getByRole('menu')).toBeDefined();

      // Escape key down
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });
});
