import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguage } from './useLanguage';

const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
const mockI18n = {
  language: 'es-PE',
  resolvedLanguage: 'es',
  changeLanguage: mockChangeLanguage,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

describe('useLanguage hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.documentElement.lang = 'es';
    
    mockI18n.language = 'es-PE';
    mockI18n.resolvedLanguage = 'es';
  });

  it('initializes language to es when resolvedLanguage is es', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('normalizes language to en when language starts with en', () => {
    mockI18n.language = 'en-US';
    mockI18n.resolvedLanguage = undefined as any;

    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('sets language correctly', async () => {
    const { result } = renderHook(() => useLanguage());
    
    await act(async () => {
      await result.current.setLanguage('en');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('sgi_lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('toggles language correctly', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      result.current.toggleLanguage();
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});
