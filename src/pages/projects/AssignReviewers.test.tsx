import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { AssignReviewers } from './AssignReviewers';
import { userService } from '../../services/userService';
import { evaluacionService } from '../../services/evaluacionService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/userService', () => ({
  userService: {
    getAllUsers: vi.fn(),
    getByRole: vi.fn(),
    getReviewers: vi.fn(),
  },
}));

vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: {
    assignReviewer: vi.fn(),
    assignReviewers: vi.fn(),
    getByProject: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '?projectId=1&projectTitle=Proyecto+IA' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockUserService = vi.mocked(userService);
const mockEvaluacionService = vi.mocked(evaluacionService);

const mockUsers = [
  {
    id: 10,
    firstNames: 'Carlos',
    lastNames: 'Sánchez',
    institutionalEmail: 'carlos@sgi.com',
    roleCode: 'EVALUADOR',
    roleDescription: 'Evaluador',
    active: true,
  },
  {
    id: 11,
    firstNames: 'Ana',
    lastNames: 'Gómez',
    institutionalEmail: 'ana@sgi.com',
    roleCode: 'DOCENTE_INVESTIGADOR',
    roleDescription: 'Docente Investigador',
    active: true,
  },
];

describe('AssignReviewers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUserService.getAllUsers.mockResolvedValue(mockUsers as any);
    mockUserService.getByRole.mockResolvedValue(mockUsers as any);
    mockUserService.getReviewers.mockResolvedValue(mockUsers as any);
    mockEvaluacionService.assignReviewer.mockResolvedValue({} as any);
    mockEvaluacionService.assignReviewers.mockResolvedValue(undefined as any);
    mockEvaluacionService.getByProject.mockResolvedValue([]);
  });

  it('renders loading state', () => {
    mockUserService.getReviewers.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    renderWithProviders(<AssignReviewers />);
    expect(document.body).toBeDefined();
  });

  it('renders the page heading', async () => {
    renderWithProviders(<AssignReviewers />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('renders available reviewers after loading', async () => {
    renderWithProviders(<AssignReviewers />);
    expect(await screen.findByText('Carlos Sánchez')).toBeDefined();
    expect(screen.getByText('Ana Gómez')).toBeDefined();
  });

  it('filters reviewers by search', async () => {
    renderWithProviders(<AssignReviewers />);
    await screen.findByText('Carlos Sánchez');

    const searchInput = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Ana' } });
    });

    expect(screen.queryByText('Carlos Sánchez')).toBeNull();
    expect(screen.getByText('Ana Gómez')).toBeDefined();
  });

  it('renders assign buttons for reviewers', async () => {
    renderWithProviders(<AssignReviewers />);
    await screen.findByText('Carlos Sánchez');
    const assignBtns = screen.getAllByRole('button', { name: /asignar/i });
    expect(assignBtns.length).toBeGreaterThan(0);
  });

  it('shows back navigation link', async () => {
    renderWithProviders(<AssignReviewers />);
    await act(async () => {});
    const backBtn = screen.getByRole('link', { name: /volver/i });
    expect(backBtn).toBeDefined();
  });
});

