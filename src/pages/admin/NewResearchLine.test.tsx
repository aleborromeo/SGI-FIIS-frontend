import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { NewResearchLine } from './NewResearchLine';
import { researchService } from '../../services/researchService';

const mockCreateLine = vi.hoisted(() => vi.fn());

vi.mock('../../services/researchService', () => ({
  researchService: {
    createLine: mockCreateLine,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter>
        <NewResearchLine />
      </MemoryRouter>
    </ToastProvider>
  );

describe('NewResearchLine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title', () => {
    renderPage();
    expect(screen.getByText('Nueva Línea de Investigación')).toBeDefined();
  });

  it('creates a line via the form', async () => {
    mockCreateLine.mockResolvedValue({ id: 5, lineName: 'Nueva Linea' });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/Inteligencia Artificial/), { target: { value: 'Nueva Linea' } });

    const submit = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submit);

    await waitFor(() => expect(mockCreateLine).toHaveBeenCalledWith({ lineName: 'Nueva Linea' }));
  });
});
