import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from './useLanguage';

const state: { lang: 'es' | 'en' } = { lang: 'es' };
const changeLanguage = vi.fn(async (l: 'es' | 'en') => {
  state.lang = l;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      get language() {
        return state.lang;
      },
      get resolvedLanguage() {
        return state.lang;
      },
      changeLanguage,
    },
  }),
}));

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    changeLanguage.mockClear();
    state.lang = 'es';
    document.documentElement.lang = '';
  });
  afterEach(() => localStorage.clear());

  it('retorna idioma es por defecto', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('es');
  });

  it('setLanguage cambia i18n, guarda en localStorage y actualiza document.lang', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {
      await result.current.setLanguage('en');
    });
    expect(changeLanguage).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('sgi_lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLanguage normaliza variantes en/en-US a en', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {
      await result.current.setLanguage('en-US' as 'en');
    });
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('toggleLanguage pasa de es a en', async () => {
    state.lang = 'es';
    const { result } = renderHook(() => useLanguage());
    await act(async () => {
      await result.current.toggleLanguage();
    });
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('toggleLanguage pasa de en a es', async () => {
    state.lang = 'en';
    const { result } = renderHook(() => useLanguage());
    await act(async () => {
      await result.current.toggleLanguage();
    });
    expect(changeLanguage).toHaveBeenCalledWith('es');
  });
});
