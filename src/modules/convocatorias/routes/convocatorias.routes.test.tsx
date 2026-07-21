import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { convocatoriasRoutes } from './convocatorias.routes';

describe('convocatoriasRoutes', () => {
  it('is a valid route element tree', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>{convocatoriasRoutes}</Routes>
      </MemoryRouter>
    );
    expect(container).toBeDefined();
  });
});
