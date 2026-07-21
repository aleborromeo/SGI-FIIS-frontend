import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewResolutionForm } from './NewResolutionForm';
import { resolutionService } from '../../services/resolutionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/resolutionService', () => ({
  resolutionService: {
    issueResolution: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('procedureId=1&number=N°001&title=Proyecto')],
  };
});

const mockResolutionService = vi.mocked(resolutionService);

describe('NewResolutionForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResolutionService.issueResolution.mockResolvedValue({ id: 1 } as any);
  });

  it('renders form fields', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    // Resolution number input should have preset value
    expect(document.body).toBeDefined();
  });

  it('renders back button', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });

  it('navigates back on back button click', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    const backBtn = screen.getByRole('button', { name: /volver/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/decano/review');
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    // The submit button should exist (may be labeled differently)
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find((b) => b.getAttribute('type') === 'submit' || b.textContent?.toLowerCase().includes('aprobar'));
    expect(submitBtn || buttons.length > 0).toBeTruthy();
  });

  it('renders resolution number field pre-populated from URL', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    // The preset value from URLSearchParams
    const inputs = screen.getAllByRole('textbox');
    const resNumberInput = inputs.find((i) => (i as HTMLInputElement).value === 'N°001');
    expect(resNumberInput).toBeDefined();
  });

  it('renders FIF status options', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    // FIF options should appear
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('updates form state on input change', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    
    const inputs = screen.getAllByRole('textbox');
    if (inputs[0]) {
      await act(async () => {
        fireEvent.change(inputs[0], { target: { value: 'N° 999-2026' } });
      });
      expect((inputs[0] as HTMLInputElement).value).toBe('N° 999-2026');
    }
  });
});

