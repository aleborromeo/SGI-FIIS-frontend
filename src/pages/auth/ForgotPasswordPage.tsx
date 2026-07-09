import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './LoginPage.css'; // Reutilizamos los estilos premium del login
import frontisBg from '../../assets/images/frontis_fiis.png';
import userSesionIcon from '../../assets/images/user-sesion.jpg';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('El correo institucional es obligatorio.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Por favor, ingrese un correo válido.');
      return;
    }

    if (!email.toLowerCase().endsWith('.edu.pe')) {
      setErrorMsg('El correo debe pertenecer al dominio institucional (.edu.pe).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      setSuccessMsg(response.message || 'Código enviado con éxito a su correo.');
      setTimeout(() => {
        setStep(2);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al enviar el código. Verifique su correo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!code || !newPassword || !confirmPassword) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    if (code.length !== 6) {
      setErrorMsg('El código de verificación debe tener 6 dígitos.');
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

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword({
        email,
        code,
        newPassword,
        confirmPassword
      });

      setSuccessMsg(response.message || 'Contraseña restablecida con éxito. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Código incorrecto, expirado o error al restablecer.');
    } finally {
      setIsSubmitting(false);
    }
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
          
          {/* Botón Regresar */}
          <button 
            type="button"
            className="login-back-btn" 
            onClick={() => step === 1 ? navigate('/login') : setStep(1)}
            title="Regresar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="login-card-header">
            <img src={userSesionIcon} alt="Logo" className="login-logo-img" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a365d', marginTop: '0.5rem' }}>
              Recuperar Contraseña
            </h2>
            <p className="login-logo-subtitle" style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              {step === 1 
                ? 'Ingrese su correo institucional para recibir un código de verificación de 6 dígitos.'
                : `Ingrese el código enviado a ${email} y su nueva contraseña.`
              }
            </p>
          </div>

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

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="login-form">
              {/* Input Correo */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo institucional</label>
                <div className="input-group-custom">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="email"
                    className="form-input-custom"
                    placeholder="ejemplo@unas.edu.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn-custom"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <span>Enviar Código</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="login-form">
              {/* Input Código */}
              <div className="form-group">
                <label htmlFor="code" className="form-label">Código de verificación</label>
                <div className="input-group-custom">
                  <span className="input-icon-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="code"
                    maxLength={6}
                    className="form-input-custom"
                    placeholder="Código de 6 dígitos"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Solo números
                    disabled={isSubmitting}
                  />
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

              <button
                type="submit"
                className="login-submit-btn-custom"
                disabled={isSubmitting || !code || !newPassword || !confirmPassword}
              >
                {isSubmitting ? (
                  <span className="btn-spinner"></span>
                ) : (
                  <span>Restablecer Contraseña</span>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="login-card-footer">
          <p>© 2026 SGI - Universidad Nacional Agraria de la Selva</p>
        </div>
      </div>
    </div>
  );
};
