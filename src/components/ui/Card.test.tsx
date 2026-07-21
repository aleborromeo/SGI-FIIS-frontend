import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent } from './Card';

describe('Card components', () => {
  it('renders Card, CardHeader and CardContent correctly', () => {
    render(
      <Card interactive={true} className="my-card">
        <CardHeader className="my-header">Header text</CardHeader>
        <CardContent className="my-content">Content text</CardContent>
      </Card>
    );

    const card = screen.getByText('Header text').parentElement as HTMLDivElement;
    expect(card.classList.contains('card-hover')).toBe(true);
    expect(card.classList.contains('my-card')).toBe(true);

    const header = screen.getByText('Header text');
    expect(header.classList.contains('card-header')).toBe(true);
    expect(header.classList.contains('my-header')).toBe(true);

    const content = screen.getByText('Content text');
    expect(content.classList.contains('card-content')).toBe(true);
    expect(content.classList.contains('my-content')).toBe(true);
  });
});
