import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../services/api';
import './LoginPage.css'; // Reutilizamos los estilos premium del login
import frontisBg from '../../assets/images/frontis_fiis.png';
import userSesionIcon from '../../assets/images/user-sesion.jpg';

export const ChangePasswordPage: React.FC = () => {
  const { user, logout, completeRegistration } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirigir si no está logueado o si no necesita cambiar contraseña
  useEffect(() => {
    const storedUser = localStorage.getItem('sgi_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser && parsedUser.mustChangePassword === false) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('La nueva contraseña no puede ser igual a la contraseña actual.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Llamar al endpoint del backend para cambiar la contraseña
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      setSuccessMsg('Contraseña actualizada con éxito. Redirigiendo...');
      
      // Actualizar el estado del usuario localmente para quitar la bandera mustChangePassword
      const storedToken = localStorage.getItem('sgi_token');
      const storedUser = localStorage.getItem('sgi_user');
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.mustChangePassword = false;
        localStorage.setItem('sgi_user', JSON.stringify(parsedUser));
        
        // Actualizar el contexto de autenticación llamando a completeRegistration
        completeRegistration({
          token: storedToken,
          type: 'Bearer',
          email: parsedUser.email,
          firstNames: parsedUser.firstNames,
          lastNames: parsedUser.lastNames,
          roleCode: parsedUser.roleCode,
          mustChangePassword: false,
          requiresVerification: false
        });
      }

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cambiar la contraseña. Verifique sus datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Si cancela, lo deslogueamos ya que cambiar contraseña es obligatorio para usar la app
    logout();
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div 
        className="login-bg-blur" 
        style={{ backgroundImage: `url("${frontisBg}")` }}
      />
      <div className="login-overlay" />

      <div className="login-content-wrapper">
        <div className="login-card-container">
          <div className="login-card-header">
            <img src={userSesionIcon} alt="Logo" className="login-logo-img" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a365d', marginTop: '0.5rem' }}>
              Cambio de Contraseña Obligatorio
            </h2>
            <p className="login-logo-subtitle" style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Por seguridad, debe actualizar su contraseña temporal antes de continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errorMsg && (
              <div className="login-error-alert animate-fade-in" role="alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="login-error-alert animate-fade-in" style={{ backgroundColor: '#ecfdf5', borderColor: '#34d399', color: '#065f46' }} role="alert">
                <span className="alert-icon">✅</span>
                <span className="alert-text">{successMsg}</span>
              </div>
            )}

            {/* Input Contraseña Actual */}
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">Contraseña actual (DNI)</label>
              <div className="input-group-custom">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  className="form-input-custom"
                  placeholder="Ingrese su contraseña actual o DNI"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle-btn-custom"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Input Nueva Contraseña */}
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">Nueva contraseña</label>
              <div className="input-group-custom">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  className="form-input-custom"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle-btn-custom"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Input Confirmar Contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmar nueva contraseña</label>
              <div className="input-group-custom">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="form-input-custom"
                  placeholder="Repita su nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle-btn-custom"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="login-submit-btn-custom"
                style={{ backgroundColor: '#64748b', flex: 1 }}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="login-submit-btn-custom"
                style={{ flex: 2 }}
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSubmitting ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <span>Actualizar</span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="login-card-footer">
          <p>© 2026 SGI - Universidad Nacional Agraria de la Selva</p>
        </div>
      </div>
    </div>
  );
};
