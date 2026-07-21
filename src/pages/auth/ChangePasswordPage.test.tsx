import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ChangePasswordPage } from './ChangePasswordPage';
import i18n from '../../i18n';

vi.mock('../../services/api', () => ({
  api: { post: vi.fn() },
}));

const mockApi = vi.mocked(api);

function renderPage() {
  const auth = {
    logout: vi.fn(),
    completeRegistration: vi.fn(),
  } as any;
  localStorage.setItem(
    'sgi_user',
    JSON.stringify({ mustChangePassword: true, email: 'a@unas.edu.pe', firstNames: 'A', lastNames: 'B', roleCode: 'ESTUDIANTE' })
  );
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <ChangePasswordPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('renderiza el formulario de cambio de contraseña', () => {
    renderPage();
    expect(screen.getByLabelText(i18n.t('auth:changePassword.currentPasswordLabel'))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t('auth:changePassword.newPasswordLabel'))).toBeInTheDocument();
  });

  function submitButton() {
    return document.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  it('muestra error de validacion si la nueva contraseña no cumple reglas', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.currentPasswordLabel')), { target: { value: 'Old123!' } });
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.newPasswordLabel')), { target: { value: 'New12345' } });
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.confirmPasswordLabel')), { target: { value: 'New12345' } });
    fireEvent.click(submitButton());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('llama a api.post al enviar contraseñas validas', async () => {
    mockApi.post.mockResolvedValue({});
    renderPage();
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.currentPasswordLabel')), { target: { value: 'Old123!' } });
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.newPasswordLabel')), { target: { value: 'New123!' } });
    fireEvent.change(screen.getByLabelText(i18n.t('auth:changePassword.confirmPasswordLabel')), { target: { value: 'New123!' } });
    fireEvent.click(submitButton());
    expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'Old123!',
      newPassword: 'New123!',
    });
  });
});
