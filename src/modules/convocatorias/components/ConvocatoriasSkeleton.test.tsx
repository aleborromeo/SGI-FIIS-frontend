import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ConvocatoriasSkeleton } from './ConvocatoriasSkeleton';

describe('ConvocatoriasSkeleton', () => {
  it('renders correct number of count placeholders', () => {
    const { container } = render(<ConvocatoriasSkeleton count={4} />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBe(4);
  });
});
