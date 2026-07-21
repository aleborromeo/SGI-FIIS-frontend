import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import type { CallResponse } from '../../services/callService';
import EditConvocatoria from './EditConvocatoria';
import i18n from '../../i18n';

vi.mock('../../services/researchService', () => ({
  researchService: { getLines: vi.fn() },
}));
vi.mock('../../services/callService', () => ({
  callService: { create: vi.fn(), update: vi.fn(), getById: vi.fn() },
}));

const mockResearch = vi.mocked(researchService);
const mockCall = vi.mocked(callService);

const call: CallResponse = {
  id: 5,
  title: 'Convocatoria a editar',
  description: 'Desc',
  status: 'ABIERTA',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  researchLineIds: [],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/convocatorias/5/edit']}>
      <Routes>
        <Route path="/convocatorias/:id/edit" element={
          <ToastProvider>
            <EditConvocatoria />
          </ToastProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('EditConvocatoria', () => {
  beforeEach(() => vi.resetAllMocks());

  it('carga la convocatoria y muestra el formulario', async () => {
    mockCall.getById.mockResolvedValue(call);
    mockResearch.getLines.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByDisplayValue('Convocatoria a editar')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('convocatorias:pages.editPage.title'))).toBeInTheDocument();
  });

  it('muestra mensaje si no encuentra la convocatoria', async () => {
    mockCall.getById.mockRejectedValue(new Error('No encontrada'));
    mockResearch.getLines.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(i18n.t('convocatorias:pages.editPage.notFound'))).toBeInTheDocument();
  });
});
