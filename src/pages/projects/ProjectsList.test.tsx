import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import ProjectsList from './ProjectsList';
import i18n from '../../i18n';

vi.mock('../../services/projectService', () => ({
  projectService: {
    getAll: vi.fn(),
    getMyDrafts: vi.fn(),
    deleteDraft: vi.fn(),
  },
}));

const mockProject = vi.mocked(projectService);

function renderPage(role = 'DOCENTE_INVESTIGADOR') {
  const auth = { currentRole: role, user: { id: 1 } } as any;
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <ProjectsList />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

const projects = [
  { id: 1, title: 'Proyecto Demo', status: 'POSTULADO', principalInvestigator: 'Ana', modality: 'PROYECTO', startDate: '2026-01-01', endDate: '2026-12-31' },
];

describe('ProjectsList', () => {
  beforeEach(() => vi.resetAllMocks());

  it('carga y muestra los proyectos', async () => {
    mockProject.getAll.mockResolvedValue(projects);
    mockProject.getMyDrafts.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Proyecto Demo')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('projects:list.pageTitle'))).toBeInTheDocument();
  });

  it('muestra error si falla la carga', async () => {
    mockProject.getAll.mockRejectedValue(new Error('Error de red'));
    mockProject.getMyDrafts.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/Error de red/)).toBeInTheDocument();
  });
});
