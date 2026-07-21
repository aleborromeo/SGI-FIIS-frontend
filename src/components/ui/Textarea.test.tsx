import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea with label and support ref forwarding', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Biography" placeholder="Describe yourself" ref={ref} />);

    const textareaElement = screen.getByPlaceholderText('Describe yourself') as HTMLTextAreaElement;
    expect(textareaElement).toBeDefined();
    expect(screen.getByText('Biography')).toBeDefined();
    expect(ref.current).toBe(textareaElement);
  });

  it('renders error text when error prop is provided', () => {
    render(<Textarea placeholder="Bio" error="Too short" />);

    expect(screen.getByText('Too short')).toBeDefined();
    const textareaElement = screen.getByPlaceholderText('Bio');
    expect(textareaElement.classList.contains('input-error')).toBe(true);
  });

  it('renders helpText when provided without error', () => {
    render(<Textarea placeholder="Comment" helpText="Max 200 chars" />);

    expect(screen.getByText('Max 200 chars')).toBeDefined();
    expect(screen.getByText('Max 200 chars').classList.contains('error')).toBe(false);
  });

  it('prioritizes error text over helpText', () => {
    render(<Textarea placeholder="Comment" helpText="Max 200 chars" error="Invalid text" />);

    expect(screen.getByText('Invalid text')).toBeDefined();
    expect(screen.queryByText('Max 200 chars')).toBeNull();
  });
});
