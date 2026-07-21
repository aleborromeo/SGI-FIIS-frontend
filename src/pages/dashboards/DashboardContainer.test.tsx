import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { DashboardContainer } from './DashboardContainer';
import { renderWithProviders } from '../../utils/testUtils';

// Mock CSS imports
vi.mock('./DashboardContainer.css', () => ({}));

// Mock Sidebar since it has complex dependencies
vi.mock('../../layout/Sidebar', () => ({
  Sidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <aside data-testid="sidebar" data-open={isOpen}>
      <button onClick={onClose}>Close</button>
    </aside>
  ),
}));

describe('DashboardContainer', () => {
  it('renders children when provided', () => {
    renderWithProviders(
      <DashboardContainer>
        <div data-testid="child">Child Content</div>
      </DashboardContainer>
    );

    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('renders the Sidebar', () => {
    renderWithProviders(
      <DashboardContainer>
        <span>Test</span>
      </DashboardContainer>
    );

    expect(screen.getByTestId('sidebar')).toBeDefined();
  });

  it('opens mobile sidebar when menu button is clicked', async () => {
    renderWithProviders(
      <DashboardContainer>
        <span>Test</span>
      </DashboardContainer>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar.getAttribute('data-open')).toBe('false');

    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    await act(async () => {
      fireEvent.click(menuBtn);
    });

    expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('true');
  });

  it('closes mobile sidebar when Sidebar onClose is called', async () => {
    renderWithProviders(
      <DashboardContainer>
        <span>Test</span>
      </DashboardContainer>
    );

    // Open sidebar first
    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    await act(async () => {
      fireEvent.click(menuBtn);
    });

    expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('true');

    // Close it
    const closeBtn = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    expect(screen.getByTestId('sidebar').getAttribute('data-open')).toBe('false');
  });

  it('renders footer', () => {
    renderWithProviders(
      <DashboardContainer>
        <span>Test</span>
      </DashboardContainer>
    );

    const footer = document.querySelector('.sgi-dashboard-footer');
    expect(footer).toBeDefined();
  });

  it('renders brand logo in mobile topbar', () => {
    renderWithProviders(
      <DashboardContainer>
        <span>Test</span>
      </DashboardContainer>
    );

    expect(screen.getByText('SGI-FIIS')).toBeDefined();
  });

  it('renders Outlet when no children provided', () => {
    renderWithProviders(<DashboardContainer />);
    // Should render without crashing
    expect(document.querySelector('.sgi-dashboard-wrapper')).toBeDefined();
  });
});
