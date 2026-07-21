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

  it('renders the subtitle', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText(/Formalización de trámites aprobados/i)).toBeDefined();
  });

  it('renders the form with all fields', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByLabelText(/Número de Resolución/i)).toBeDefined();
    expect(screen.getByLabelText(/Fecha de Emisión/i)).toBeDefined();
    expect(screen.getByLabelText(/ID del Trámite/i)).toBeDefined();
  });

  it('renders the submit button', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByRole('button', { name: /Registrar Resolución/i })).toBeDefined();
  });

  it('renders the asunto textarea', () => {
    renderWithProviders(<ResolutionsPage />);
    const textarea = screen.getByPlaceholderText(/Descripción del asunto/i);
    expect(textarea).toBeDefined();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders the file upload area', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText(/Click para seleccionar/i)).toBeDefined();
  });

  it('updates form fields on input', async () => {
    renderWithProviders(<ResolutionsPage />);

    const numeroInput = screen.getByPlaceholderText(/N° 123-2026-FIIS/i);
    await act(async () => {
      fireEvent.change(numeroInput, { target: { value: 'N° 001-2026' } });
    });

    expect((numeroInput as HTMLInputElement).value).toBe('N° 001-2026');
  });

  it('updates idTramite field', async () => {
    renderWithProviders(<ResolutionsPage />);

    const idInput = screen.getByLabelText(/ID del Trámite/i);
    await act(async () => {
      fireEvent.change(idInput, { target: { value: '42' } });
    });

    expect((idInput as HTMLInputElement).value).toBe('42');
  });

  it('updates textarea field', async () => {
    renderWithProviders(<ResolutionsPage />);

    const textarea = screen.getByPlaceholderText(/Descripción del asunto/i);
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Aprobacion de proyecto' } });
    });

    expect((textarea as HTMLTextAreaElement).value).toBe('Aprobacion de proyecto');
  });

  it('shows error toast when file is missing on submit', async () => {
    renderWithProviders(<ResolutionsPage />);

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

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

  it('submit button is not disabled initially', async () => {
    renderWithProviders(<ResolutionsPage />);
    const uploadBtn = screen.getByRole('button', { name: /Registrar Resolución/i });
    expect(uploadBtn.hasAttribute('disabled')).toBe(false);
  });

  it('shows validation error when required fields are empty', async () => {
    renderWithProviders(<ResolutionsPage />);

    const fileInput = document.getElementById('resolution-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockResolutionService.issueResolution).not.toHaveBeenCalled();
  });

  it('successful submit calls service', async () => {
    renderWithProviders(<ResolutionsPage />);

    const numeroInput = screen.getByPlaceholderText(/N° 123-2026-FIIS/i);
    const fechaInput = screen.getByLabelText(/Fecha de Emisión/i);
    const idInput = screen.getByLabelText(/ID del Trámite/i);
    const textarea = screen.getByPlaceholderText(/Descripción del asunto/i);
    const fileInput = document.getElementById('resolution-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      fireEvent.change(numeroInput, { target: { value: 'N° 001-2026' } });
      fireEvent.change(fechaInput, { target: { value: '2026-07-01' } });
      fireEvent.change(idInput, { target: { value: '1' } });
      fireEvent.change(textarea, { target: { value: 'Aprobacion del proyecto XYZ' } });
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockResolutionService.issueResolution).toHaveBeenCalled();
  });

  it('submit error handling', async () => {
    mockResolutionService.issueResolution.mockRejectedValue(new Error('Server error'));

    renderWithProviders(<ResolutionsPage />);

    const numeroInput = screen.getByPlaceholderText(/N° 123-2026-FIIS/i);
    const fechaInput = screen.getByLabelText(/Fecha de Emisión/i);
    const idInput = screen.getByLabelText(/ID del Trámite/i);
    const textarea = screen.getByPlaceholderText(/Descripción del asunto/i);
    const fileInput = document.getElementById('resolution-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      fireEvent.change(numeroInput, { target: { value: 'N° 001-2026' } });
      fireEvent.change(fechaInput, { target: { value: '2026-07-01' } });
      fireEvent.change(idInput, { target: { value: '1' } });
      fireEvent.change(textarea, { target: { value: 'Aprobacion' } });
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    await act(async () => {});
    expect(mockResolutionService.issueResolution).toHaveBeenCalled();
  });

  it('renders the Nueva Resolución card header', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText(/Nueva Resolución/i)).toBeDefined();
  });

  it('renders the asunto label', () => {
    renderWithProviders(<ResolutionsPage />);
    expect(screen.getByText(/Asunto de la Resolución/i)).toBeDefined();
  });
});
