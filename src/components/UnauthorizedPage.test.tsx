import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnauthorizedPage from './UnauthorizedPage';

describe('UnauthorizedPage', () => {
  it('renderiza el titulo de acceso denegado y un enlace a dashboard', () => {
    render(
      <MemoryRouter>
        <UnauthorizedPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/acceso denegado/i)).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
