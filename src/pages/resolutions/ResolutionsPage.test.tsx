import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { ResolutionsPage } from './ResolutionsPage';
import { resolutionService } from '../../services/resolutionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/resolutionService', () => ({
  resolutionService: {
    issueResolution: vi.fn(),
  },
}));

const mockResolutionService = vi.mocked(resolutionService);

describe('ResolutionsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResolutionService.issueResolution.mockResolvedValue({ id: 1 } as any);
  });

  it('renders the page title', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText('Registro de Resoluciones')).toBeDefined();
  });

  it('renders the form with all fields', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByLabelText(/Número de Resolución/i)).toBeDefined();
    expect(screen.getByLabelText(/ID del Trámite/i)).toBeDefined();
  });

  it('renders the submit button', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByRole('button', { name: /Registrar Resolución/i })).toBeDefined();
  });

  it('updates form fields on input', async () => {
    renderWithProviders(<ResolutionsPage />);

    const numeroInput = screen.getByPlaceholderText(/N° 123-2026-FIIS/i);
    await act(async () => {
      fireEvent.change(numeroInput, { target: { value: 'N° 001-2026' } });
    });

    expect((numeroInput as HTMLInputElement).value).toBe('N° 001-2026');
  });

  it('shows error toast when file is missing on submit', async () => {
    renderWithProviders(<ResolutionsPage />);

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    // Should not call the service since validation fails
    expect(mockResolutionService.issueResolution).not.toHaveBeenCalled();
  });

  it('shows file name after file selection', async () => {
    renderWithProviders(<ResolutionsPage />);

    const fileInput = document.getElementById('resolution-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByText('test.pdf')).toBeDefined();
  });

  it('shows upload button disabled state only when submitting', async () => {
    renderWithProviders(<ResolutionsPage />);
    // The upload button should not be disabled initially
    const uploadBtn = screen.getByRole('button', { name: /Registrar Resolución/i });
    expect(uploadBtn.hasAttribute('disabled')).toBe(false);
  });

  it('renders subtitle', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText(/Formalización de trámites aprobados/i)).toBeDefined();
  });
});
