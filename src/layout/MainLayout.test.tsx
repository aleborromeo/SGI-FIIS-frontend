import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';
import { renderWithProviders } from '../utils/testUtils';

vi.mock('./Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

describe('MainLayout', () => {
  it('renders children inside the layout', () => {
    renderWithProviders(
      <MainLayout>
        <div data-testid="child-content">Child Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('child-content')).toBeDefined();
  });

  it('renders the Sidebar', () => {
    renderWithProviders(
      <MainLayout>
        <span>Test</span>
      </MainLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeDefined();
  });

  it('renders multiple children', () => {
    renderWithProviders(
      <MainLayout>
        <p data-testid="para1">Paragraph 1</p>
        <p data-testid="para2">Paragraph 2</p>
      </MainLayout>
    );

    expect(screen.getByTestId('para1')).toBeDefined();
    expect(screen.getByTestId('para2')).toBeDefined();
  });
});
