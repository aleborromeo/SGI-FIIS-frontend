import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent } from './Card';

describe('Card', () => {
  it('renderiza children con clase card', () => {
    const { container } = render(<Card>Contenido</Card>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(container.querySelector('.card')).toBeTruthy();
  });

  it('aplica card-hover cuando interactive', () => {
    const { container } = render(<Card interactive>Contenido</Card>);
    expect(container.querySelector('.card')?.className).toContain('card-hover');
  });

  it('CardHeader y CardContent anidan correctamente', () => {
    const { container } = render(
      <Card>
        <CardHeader>Titulo</CardHeader>
        <CardContent>Cuerpo</CardContent>
      </Card>
    );
    expect(container.querySelector('.card-header')).toBeTruthy();
    expect(container.querySelector('.card-content')).toBeTruthy();
  });
});
