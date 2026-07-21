import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthorizedPage from './UnauthorizedPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UnauthorizedPage', () => {
  it('renders page layout with access denied details and home link', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );

    expect(screen.getByText('accessDenied')).toBeDefined();
    expect(screen.getByText('accessDeniedMessage')).toBeDefined();
    
    const link = screen.getByRole('link', { name: 'goHome' }) as HTMLAnchorElement;
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/dashboard');
  });
});
