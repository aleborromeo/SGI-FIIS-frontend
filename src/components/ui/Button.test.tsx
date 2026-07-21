import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button correctly, triggers ref forwarding and click handler', () => {
    const ref = createRef<HTMLButtonElement>();
    const handleClick = vi.fn();
    
    render(
      <Button ref={ref} variant="primary" size="md" onClick={handleClick}>
        Click Me
      </Button>
    );

    const buttonElement = screen.getByRole('button', { name: 'Click Me' });
    expect(buttonElement).toBeDefined();
    expect(ref.current).toBe(buttonElement);

    buttonElement.click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('handles click without handler and prints interaction log', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<Button>Submit Button</Button>);

    const buttonElement = screen.getByRole('button', { name: 'Submit Button' });
    buttonElement.click();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UI] Interaction: 'Submit Button' clicked")
    );
    
    logSpy.mockRestore();
  });

  it('renders icon when provided', () => {
    const mockIcon = <span data-testid="button-icon">Icon</span>;
    render(<Button icon={mockIcon}>With Icon</Button>);

    expect(screen.getByTestId('button-icon')).toBeDefined();
  });
});
