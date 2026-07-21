import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza sin crashear y muestra la pagina de bienvenida publica', async () => {
    render(<App />);
    const logo = await screen.findByAltText('SGI Logo');
    expect(logo).toBeInTheDocument();
  });
});
