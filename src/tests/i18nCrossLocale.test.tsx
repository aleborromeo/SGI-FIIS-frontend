import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthorizedPage from '../components/UnauthorizedPage';
import i18n from '../i18n';

describe('i18n cross-locale coverage (#185)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('es');
  });

  it('renderiza el texto localizado en espanol e ingles', async () => {
    await i18n.changeLanguage('es');
    const { rerender, unmount } = render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );
    const esText = i18n.t('common:accessDenied');
    expect(screen.getByText(esText)).toBeInTheDocument();

    await i18n.changeLanguage('en');
    rerender(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );
    const enText = i18n.t('common:accessDenied');
    expect(enText).not.toEqual(esText);
    expect(screen.getByText(enText)).toBeInTheDocument();
    unmount();
  });

  it('ambos namespaces (es/en) estan cargados para common', () => {
    expect(i18n.t('common:accessDenied', { lng: 'es' })).toBeTruthy();
    expect(i18n.t('common:accessDenied', { lng: 'en' })).toBeTruthy();
    expect(i18n.t('common:accessDenied', { lng: 'es' })).not.toEqual(
      i18n.t('common:accessDenied', { lng: 'en' })
    );
  });
});
