import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

const TestComponent = () => {
  const { success, error, warning, info } = useToast();

  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => info('Info message')}>Info</button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children correctly and does not show toast initially', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.queryByText('Success message')).toBeNull();
  });

  it('adds and auto-dismisses toasts of various types', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Trigger Success Toast
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByText('Success message')).toBeDefined();

    // Trigger Error Toast
    act(() => {
      screen.getByText('Error').click();
    });
    expect(screen.getByText('Error message')).toBeDefined();

    // Trigger Warning Toast
    act(() => {
      screen.getByText('Warning').click();
    });
    expect(screen.getByText('Warning message')).toBeDefined();

    // Trigger Info Toast
    act(() => {
      screen.getByText('Info').click();
    });
    expect(screen.getByText('Info message')).toBeDefined();

    // Advance timers by 4000ms (auto-dismiss duration)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Check all toasts are dismissed
    expect(screen.queryByText('Success message')).toBeNull();
    expect(screen.queryByText('Error message')).toBeNull();
    expect(screen.queryByText('Warning message')).toBeNull();
    expect(screen.queryByText('Info message')).toBeNull();
  });

  it('allows manual dismissal by clicking the close button', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Trigger success toast
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByText('Success message')).toBeDefined();

    // Find close button and click it
    const closeButtons = screen.getAllByRole('button');
    // closeButtons[0] = Success button, closeButtons[1] = Error, closeButtons[2] = Warning, closeButtons[3] = Info, closeButtons[4] = Close X
    const xButton = closeButtons[4];
    expect(xButton).toBeDefined();

    act(() => {
      xButton.click();
    });

    expect(screen.queryByText('Success message')).toBeNull();
  });

  it('throws error if useToast is used outside of ToastProvider', () => {
    const ErrorComponent = () => {
      useToast();
      return null;
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ErrorComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleSpy.mockRestore();
  });
});
