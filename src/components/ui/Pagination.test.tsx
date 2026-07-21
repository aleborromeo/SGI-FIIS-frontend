import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Pagination from './Pagination';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'showingXofY') {
        return `Showing ${options?.x} of ${options?.y}`;
      }
      return key;
    },
  }),
}));

describe('Pagination', () => {
  it('returns null if totalPages <= 1', () => {
    const handlePageChange = vi.fn();
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={10}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly and triggers onPageChange on button clicks', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        totalItems={30}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByText('Showing 11–20 of 30')).toBeDefined();
    
    // Page buttons
    const p1Button = screen.getByText('1');
    const p2Button = screen.getByText('2');
    const p3Button = screen.getByText('3');

    expect(p1Button).toBeDefined();
    expect(p2Button).toBeDefined();
    expect(p3Button).toBeDefined();

    // Click previous page button
    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0];
    const nextButton = buttons[buttons.length - 1];

    prevButton.click();
    expect(handlePageChange).toHaveBeenCalledWith(1);

    nextButton.click();
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('renders ellipsis when totalPages is large and currentPage is in the middle', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        totalItems={100}
        pageSize={10}
        onPageChange={handlePageChange}
        siblingCount={1}
      />
    );

    // Should show 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2);
  });

  it('handles prev and next buttons disabled states', () => {
    const handlePageChange = vi.fn();
    
    // At page 1
    const { rerender } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0];
    const nextButton = buttons[buttons.length - 1];

    expect(prevButton.hasAttribute('disabled')).toBe(true);
    expect(nextButton.hasAttribute('disabled')).toBe(false);

    // At last page
    rerender(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={50}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    const rebuttons = screen.getAllByRole('button');
    const reprevButton = rebuttons[0];
    const reprevNext = rebuttons[rebuttons.length - 1];

    expect(reprevButton.hasAttribute('disabled')).toBe(false);
    expect(reprevNext.hasAttribute('disabled')).toBe(true);
  });
});
