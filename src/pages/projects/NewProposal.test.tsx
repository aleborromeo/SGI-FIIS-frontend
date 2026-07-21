import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import { projectService } from '../../services/projectService';
import NewProposal from './NewProposal';

vi.mock('../../services/researchService', () => ({
  researchService: { getLines: vi.fn(), getGroups: vi.fn(), getGroupsByLine: vi.fn() },
}));
vi.mock('../../services/callService', () => ({
  callService: { getVigent: vi.fn() },
}));
vi.mock('../../services/projectService', () => ({
  projectService: { create: vi.fn() },
}));

const mockResearch = vi.mocked(researchService);
const mockCall = vi.mocked(callService);

function renderPage() {
  const auth = { currentRole: 'DOCENTE_INVESTIGADOR', user: { id: 1 } } as any;
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <ToastProvider>
          <NewProposal />
        </ToastProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('NewProposal (projects)', () => {
  beforeEach(() => vi.resetAllMocks());

  it('carga lineas, grupos y convocatorias y muestra el formulario', async () => {
    mockResearch.getLines.mockResolvedValue([]);
    mockResearch.getGroups.mockResolvedValue([]);
    mockCall.getVigent.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Datos Generales')).toBeInTheDocument();
    expect(screen.getByText('Documento Principal')).toBeInTheDocument();
  });
});
