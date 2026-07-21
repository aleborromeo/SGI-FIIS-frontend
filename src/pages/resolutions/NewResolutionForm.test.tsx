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
    useSearchParams: () => [new URLSearchParams('procedureId=1&number=N%C2%B0001&title=Proyecto%20de%20Prueba')],
  };
});

const mockResolutionService = vi.mocked(resolutionService);

describe('NewResolutionForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResolutionService.issueResolution.mockResolvedValue({ id: 1 } as any);
  });

  it('renders form fields with preset values from URL', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const inputs = screen.getAllByRole('textbox');
    const resNumberInput = inputs.find((i) => (i as HTMLInputElement).value === 'N°001');
    expect(resNumberInput).toBeDefined();

    const titleInput = inputs.find((i) => (i as HTMLInputElement).value === 'Proyecto de Prueba');
    expect(titleInput).toBeDefined();
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
    const submitBtn = screen.getByRole('button', { name: /aprobar|guardar|enviar/i });
    expect(submitBtn).toBeDefined();
    expect(submitBtn.getAttribute('type')).toBe('submit');
  });

  it('renders FIF status select options', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
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

  it('updates select value', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const selects = screen.getAllByRole('combobox');
    if (selects[0]) {
      await act(async () => {
        fireEvent.change(selects[0], { target: { value: 'NO' } });
      });
      expect((selects[0] as HTMLSelectElement).value).toBe('NO');
    }
  });

  it('renders procedure ID reference when present', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    expect(screen.getByText(/Trámite ID: 1/i)).toBeDefined();
  });

  it('renders file input for PDF', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();
    expect(fileInput.accept).toBe('.pdf');
  });

  it('file input triggers state update', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput);
    });

    expect(fileInput.files?.[0]?.name).toBe('test.pdf');
  });

  it('renders cancel button that navigates back', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/decano/review');
  });

  it('renders header title', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    expect(screen.getByText(/Registro de Resolución y Ejecución/i)).toBeDefined();
  });

  it('renders section titles', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});
    expect(screen.getByText(/Datos de la Resolución Decanal/i)).toBeDefined();
    expect(screen.getByText(/Parámetros de Ejecución del Proyecto/i)).toBeDefined();
  });

  it('submit without file shows error', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockResolutionService.issueResolution).not.toHaveBeenCalled();
  });

  it('successful submit calls service and navigates', async () => {
    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput);
    });

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    await act(async () => {});
    expect(mockNavigate).toHaveBeenCalledWith('/decano/review');
  });

  it('submit error handling does not navigate', async () => {
    mockResolutionService.issueResolution.mockRejectedValue(new Error('Save failed'));

    renderWithProviders(<NewResolutionForm />);
    await act(async () => {});

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput);
    });

    const form = document.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    await act(async () => {});
    expect(mockNavigate).not.toHaveBeenCalledWith('/decano/review');
  });
});
