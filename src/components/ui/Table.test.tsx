import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';

describe('Table', () => {
  it('renderiza la estructura de tabla con headers y celdas', () => {
    render(
      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Nombre</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Ana</TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ana' })).toBeInTheDocument();
  });

  it('aplica clases base', () => {
    const { container } = render(
      <TableContainer>
        <TableBody>
          <TableRow className="fila">x</TableRow>
        </TableBody>
      </TableContainer>
    );
    expect(container.querySelector('.table-container')).toBeTruthy();
    expect(container.querySelector('tr')?.className).toContain('fila');
  });
});
