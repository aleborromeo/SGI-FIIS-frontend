import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from './ConfirmContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestComponent = ({ onResult, options }: { onResult: (val: boolean) => void; options: any }) => {
  const { confirmDialog } = useConfirm();

  const handleShow = async () => {
    const result = await confirmDialog(options);
    onResult(result);
  };

  return <button onClick={handleShow}>Trigger Confirm</button>;
};

describe('ConfirmContext', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  it('renders children correctly and does not show dialog initially', () => {
    render(
      <ConfirmProvider>
        <div data-testid="child">Child Content</div>
      </ConfirmProvider>
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.queryByText('Confirm Title')).toBeNull();
    expect(document.body.classList.contains('confirm-modal-open')).toBe(false);
  });

  it('opens dialog, adds body class, and resolves true on confirm', async () => {
    const mockOnResult = vi.fn();
    const options = {
      title: 'Confirm Title',
      message: 'Confirm Message',
      confirmText: 'Yes, Do It',
      cancelText: 'No Way',
    };

    render(
      <ConfirmProvider>
        <TestComponent onResult={mockOnResult} options={options} />
      </ConfirmProvider>
    );

    // Trigger dialog
    await act(async () => {
      screen.getByText('Trigger Confirm').click();
    });

    // Check dialog content is in document (via portal)
    expect(screen.getByText('Confirm Title')).toBeDefined();
    expect(screen.getByText('Confirm Message')).toBeDefined();
    expect(screen.getByText('Yes, Do It')).toBeDefined();
    expect(screen.getByText('No Way')).toBeDefined();
    expect(document.body.classList.contains('confirm-modal-open')).toBe(true);

    // Click Confirm
    await act(async () => {
      screen.getByText('Yes, Do It').click();
    });

    // Check modal closed and resolved true
    expect(screen.queryByText('Confirm Title')).toBeNull();
    expect(mockOnResult).toHaveBeenCalledWith(true);
    expect(document.body.classList.contains('confirm-modal-open')).toBe(false);
  });

  it('opens dialog and resolves false on cancel', async () => {
    const mockOnResult = vi.fn();
    const options = {
      title: 'Delete Item',
      message: 'Are you sure?',
      danger: true,
    };

    render(
      <ConfirmProvider>
        <TestComponent onResult={mockOnResult} options={options} />
      </ConfirmProvider>
    );

    // Trigger dialog
    await act(async () => {
      screen.getByText('Trigger Confirm').click();
    });

    // Click Cancel (which will use i18n fallback 'common:cancel' or similar since no cancelText is provided)
    await act(async () => {
      screen.getByText('common:cancel').click();
    });

    expect(mockOnResult).toHaveBeenCalledWith(false);
    expect(document.body.classList.contains('confirm-modal-open')).toBe(false);
  });

  it('throws error if useConfirm is used outside of ConfirmProvider', () => {
    const ErrorComponent = () => {
      useConfirm();
      return null;
    };

    // Prevent React's console.error noise in test output for caught errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<ErrorComponent />)).toThrow(
      'useConfirm must be used within a ConfirmProvider'
    );

    consoleSpy.mockRestore();
  });
});
