import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { evaluacionService } from '../../services/evaluacionService';
import AssignReviewers from './AssignReviewers';
import i18n from '../../i18n';

vi.mock('../../services/userService', () => ({
  userService: { getReviewers: vi.fn() },
}));
vi.mock('../../services/evaluacionService', () => ({
  evaluacionService: { assignReviewers: vi.fn() },
}));

const mockUser = vi.mocked(userService);
const mockEval = vi.mocked(evaluacionService);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/projects/assign?projectId=1']}>
      <ToastProvider>
        <AssignReviewers />
      </ToastProvider>
    </MemoryRouter>
  );
}

const reviewers = [
  { id: 10, firstNames: 'Carlos', lastNames: 'Mendoza', roleCode: 'EVALUADOR', roleDescription: 'Evaluador' },
];

describe('AssignReviewers', () => {
  beforeEach(() => vi.resetAllMocks());

  it('carga los revisores y muestra el titulo', async () => {
    mockUser.getReviewers.mockResolvedValue(reviewers as any);
    renderPage();
    expect(await screen.findByText(i18n.t('projects:assignReviewers.pageTitle'))).toBeInTheDocument();
    expect(screen.getByText(/Carlos Mendoza/i)).toBeInTheDocument();
  });

  it('muestra error si falla la carga de revisores', async () => {
    mockUser.getReviewers.mockRejectedValue(new Error('Sin acceso'));
    renderPage();
    expect(await screen.findByText(i18n.t('projects:assignReviewers.errorLoadingTeachersDetail'))).toBeInTheDocument();
  });
});
