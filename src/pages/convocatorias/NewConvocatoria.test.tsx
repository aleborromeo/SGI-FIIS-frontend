import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import NewConvocatoria from './NewConvocatoria';
import i18n from '../../i18n';

vi.mock('../../services/researchService', () => ({
  researchService: { getLines: vi.fn() },
}));
vi.mock('../../services/callService', () => ({
  callService: { create: vi.fn(), update: vi.fn(), getById: vi.fn() },
}));

const mockResearch = vi.mocked(researchService);
const mockCall = vi.mocked(callService);

function renderPage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <NewConvocatoria />
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('NewConvocatoria', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renderiza el formulario de nueva convocatoria', () => {
    mockResearch.getLines.mockResolvedValue([]);
    renderPage();
    expect(screen.getByText(i18n.t('convocatorias:pages.newPage.title'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(i18n.t('convocatorias:pages.newPage.createCall')) })
    ).toBeInTheDocument();
  });

  it('no llama a create si falta el titulo (validacion)', async () => {
    mockResearch.getLines.mockResolvedValue([]);
    mockCall.create.mockResolvedValue({} as any);
    renderPage();
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(i18n.t('convocatorias:pages.newPage.createCall')) })
    );
    expect(mockCall.create).not.toHaveBeenCalled();
  });
});
