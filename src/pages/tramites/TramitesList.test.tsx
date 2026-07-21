import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TramitesList } from './TramitesList';

describe('TramitesList', () => {
  it('renderiza el titulo y los tramites de ejemplo', () => {
    render(
      <MemoryRouter>
        <TramitesList />
      </MemoryRouter>
    );
    expect(screen.getByText(/trámites/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sistema de detección automática de enfermedades en hojas de banana/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Gestión de trazabilidad de proyectos de tesis/i)).toBeInTheDocument();
  });

  it('filtra por buscador', () => {
    render(
      <MemoryRouter>
        <TramitesList />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: 'banana' } });
    expect(screen.getByText(/Sistema de detección automática de enfermedades en hojas de banana/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gestión de trazabilidad de proyectos de tesis/i)).not.toBeInTheDocument();
  });
});
