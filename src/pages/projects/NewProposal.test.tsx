import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewProposal } from './NewProposal';
import { projectService } from '../../services/projectService';
import { researchService } from '../../services/researchService';
import { callService } from '../../services/callService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/projectService', () => ({
  projectService: {
    create: vi.fn(),
    getMyDrafts: vi.fn(),
  },
}));

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
  },
}));

vi.mock('../../services/callService', () => ({
  callService: {
    getById: vi.fn(),
    checkPrerequisitos: vi.fn(),
    getVigent: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?callId=1' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockProjectService = vi.mocked(projectService);
const mockResearchService = vi.mocked(researchService);
const mockCallService = vi.mocked(callService);

const mockLines = [
  { id: 1, lineName: 'Línea IA', lineCode: 'L01', active: true, groupId: 1, groupName: 'GI-SOFT' },
];

const mockGroups = [
  { id: 1, groupName: 'GI-SOFT', groupCode: 'G01', active: true },
];

describe('NewProposal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProjectService.create.mockResolvedValue({ id: 1 } as any);
    mockProjectService.getMyDrafts.mockResolvedValue([]);
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
    mockResearchService.getGroups.mockResolvedValue(mockGroups as any);
    mockCallService.getById.mockResolvedValue({
      id: 1,
      title: 'Convocatoria 2026',
      status: 'ABIERTA',
    } as any);
    mockCallService.checkPrerequisitos.mockResolvedValue({ valid: true, hasActiveGroup: true, hasVigentCalls: true, docente: true } as any);
    mockCallService.getVigent.mockResolvedValue([] as any);
  });

  it('renders the form', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('renders title input', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox', { name: /título/i });
    expect(titleInput).toBeDefined();
  });

  it('renders research line select', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('updates title on input', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox', { name: /título/i });
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi Proyecto de Investigación' } });
    });
    expect((titleInput as HTMLInputElement).value).toBe('Mi Proyecto de Investigación');
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /registrar/i });
    expect(submitBtn).toBeDefined();
  });

  it('renders back link to projects', async () => {
    renderWithProviders(<NewProposal />);
    await act(async () => {});
    const backLinks = screen.getAllByRole('link', { name: /cancelar/i });
    expect(backLinks.length).toBeGreaterThan(0);
  });
});

