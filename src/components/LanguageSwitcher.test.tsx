import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { useLanguageMock, mockedSetLanguage } = vi.hoisted(() => {
  const mockedSetLanguage = vi.fn();
  return {
    mockedSetLanguage,
    useLanguageMock: vi.fn(() => ({ language: 'es', setLanguage: mockedSetLanguage })),
  };
});

vi.mock('../hooks/useLanguage', () => ({ useLanguage: useLanguageMock }));

import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockedSetLanguage.mockClear();
  });

  it('variant select renderiza un select con opciones es/en', () => {
    render(<LanguageSwitcher variant="select" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('es');
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.getAttribute('value'))).toEqual(['es', 'en']);
  });

  it('variant button abre el menu y cambia idioma', async () => {
    render(<LanguageSwitcher variant="button" />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(trigger);
    const opciones = screen.getAllByRole('menuitemradio');
    expect(opciones.length).toBe(2);
    await userEvent.click(opciones[1]);
    expect(mockedSetLanguage).toHaveBeenCalledWith('en');
  });

  it('variant button refleja el idioma activo', () => {
    useLanguageMock.mockReturnValue({ language: 'en', setLanguage: mockedSetLanguage });
    render(<LanguageSwitcher variant="button" />);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });
});
