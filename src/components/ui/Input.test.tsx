import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input field with label and support ref forwarding', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Username" placeholder="Enter username" ref={ref} />);

    const inputElement = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
    expect(inputElement).toBeDefined();
    expect(screen.getByText('Username')).toBeDefined();
    expect(ref.current).toBe(inputElement);
  });

  it('renders error text when error prop is provided', () => {
    render(<Input placeholder="Email" error="Invalid email address" />);

    expect(screen.getByText('Invalid email address')).toBeDefined();
    const inputElement = screen.getByPlaceholderText('Email');
    expect(inputElement.classList.contains('input-error')).toBe(true);
  });

  it('renders helpText when provided without error', () => {
    render(<Input placeholder="Phone" helpText="Include country code" />);

    expect(screen.getByText('Include country code')).toBeDefined();
    expect(screen.getByText('Include country code').classList.contains('error')).toBe(false);
  });

  it('prioritizes error text over helpText', () => {
    render(<Input placeholder="Phone" helpText="Include country code" error="Required" />);

    expect(screen.getByText('Required')).toBeDefined();
    expect(screen.queryByText('Include country code')).toBeNull();
  });
});
