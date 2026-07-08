import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import './RegisterPage.css';
import frontisBg from '../../assets/images/frontis_fiis.png';
import universityIcon from '../../assets/images/icons8-universidad-50 (1).png';

export const RegisterPage: React.FC = () => {
  const { completeRegistration } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  // Paso actual: 1 para el formulario de registro, 2 para la verificación del código
  const [step, setStep] = useState<1 | 2>(1);

  // Campos del formulario
  const [dni, setDni] = useState('');
  const [firstNames, setFirstNames] = useState('');
  const [lastNames, setLastNames] = useState('');
  
  // Guardamos el correo completo
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Código de verificación
  const [verificationCode, setVerificationCode] = useState('');

  // Estados de control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const getFullEmail = () => {
    return email.trim();
  };

  const validateStep1 = (): boolean => {
    if (!firstNames.trim()) {
      setError('Los nombres son obligatorios.');
      return false;
    }
    if (!lastNames.trim()) {
      setError('Los apellidos son obligatorios.');
      return false;
    }
    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError('El DNI debe contener exactamente 8 dígitos numéricos.');
      return false;
    }
    if (!email.trim()) {
      setError('El correo institucional es obligatorio.');
      return false;
    }
    if (!email.trim().toLowerCase().endsWith('@unas.edu.pe')) {
      setError('Solo se permiten correos institucionales @unas.edu.pe.');
      return false;
    }
    if (!roleCode) {
      setError('Debe seleccionar su rol principal.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    if (!acceptTerms) {
      setError('Debe aceptar los términos y condiciones.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const fullEmail = getFullEmail();
      const response = await authService.register({
        dni,
        firstNames,
        lastNames,
        institutionalEmail: fullEmail,
        phone: phone || undefined,
        password,
        confirmPassword,
        roleCode
      });
      setSuccessMessage(response.message || 'Código de verificación enviado a tu correo institucional.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setError('El código de verificación debe contener 6 dígitos.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const fullEmail = getFullEmail();
      const response = await authService.verifyRegistration(fullEmail, verificationCode);
      setSuccessMessage('¡Cuenta verificada con éxito!');
      // Iniciar sesión en el contexto con los datos devueltos
      completeRegistration(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'El código de verificación es incorrecto o ha expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const fullEmail = getFullEmail();
      const response = await authService.resendCode(fullEmail);
      setSuccessMessage(response.message || 'Se ha reenviado un nuevo código a su correo.');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {/* Fondo difuminado usando la imagen de frontis */}
      <div 
        className="register-bg-blur" 
        style={{ backgroundImage: `url("${frontisBg}")` }}
      />
      <div className="register-overlay" />
      
      <div className="register-content-wrapper">
        
    

        {/* Tarjeta de Registro blanca sólida */}
        <div className="register-card-container">
          
          {/* Botón de salir / volver a la bienvenida */}
          <button 
            type="button" 
            className="register-back-btn" 
            onClick={() => navigate('/')}
            title="Volver a la bienvenida"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="register-card-header">
            <img src={universityIcon} alt="SGI Logo" className="login-logo-img" />
            <h1 className="login-logo-title">SGI</h1>
            <p className="login-logo-subtitle">Sistema de Gestión de Investigación</p>
          </div>
          
              <form onSubmit={handleRegisterSubmit} className="register-form">
                {error && step === 1 && (
                  <div className="register-error-alert animate-fade-in" role="alert">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">{error}</span>
                  </div>
                )}

                <div className="form-row-2col">
                  {/* Nombres */}
                  <div className="form-group">
                    <label htmlFor="firstNames" className="form-label">Nombres</label>
                    <div className="input-group-custom">
                      <span className="input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="firstNames"
                        className="form-input-custom"
                        placeholder="Nombres"
                        value={firstNames}
                        onChange={(e) => setFirstNames(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Apellidos */}
                  <div className="form-group">
                    <label htmlFor="lastNames" className="form-label">Apellidos</label>
                    <div className="input-group-custom">
                      <span className="input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="lastNames"
                        className="form-input-custom"
                        placeholder="Apellidos"
                        value={lastNames}
                        onChange={(e) => setLastNames(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-2col">
                  {/* DNI */}
                  <div className="form-group">
                    <label htmlFor="dni" className="form-label">DNI</label>
                    <div className="input-group-custom">
                      <span className="input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-3 8h2m-2 3h2" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="dni"
                        maxLength={8}
                        className="form-input-custom"
                        placeholder="DNI"
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Teléfono (Opcional)</label>
                    <div className="input-group-custom">
                      <span className="input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="phone"
                        className="form-input-custom"
                        placeholder="Teléfono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Correo Institucional */}
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
                      onChange={(e) => setEmail(e.target.value.replace(/\s+/g, ''))}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <span className="email-info-text">Solo se permiten correos institucionales @unas.edu.pe</span>
                </div>

                {/* Selección de Rol */}
                <div className="form-group">
                  <label htmlFor="role" className="form-label">Rol de Postulante</label>
                  <div className="select-wrapper">
                    <span className="input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <select
                      id="role"
                      className="form-select"
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Selecciona tu rol</option>
                      <option value="DOCENTE_INVESTIGADOR">Docente Investigador</option>
                      <option value="ESTUDIANTE">Estudiante / Tesista</option>
                    </select>

                  </div>
                </div>

                <div className="form-row-2col">
                  {/* Contraseña */}
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <div className="input-group-custom">
                      <span className="input-icon-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="form-input-custom"
                        placeholder="Crea una contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn-custom"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
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

                  {/* Confirmar Contraseña */}
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
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
                        placeholder="Confirma tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
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
                </div>

                {/* Acepto términos y condiciones */}
                <div className="terms-group">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="terms-checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isSubmitting}
                    required
                  />
                  <label htmlFor="acceptTerms" className="terms-label">
                    Acepto los <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Términos y condiciones del SGI-FIIS.'); }}>términos y condiciones</a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="register-submit-btn-custom"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Registrarme</span>
                    </>
                  )}
                </button>
              </form>

              <div className="register-card-footer-redirect">
                ¿Ya tienes una cuenta?
                <a 
                  href="/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }} 
                  className="forgot-password-link"
                >
                  Iniciar sesión
                </a>
              </div>
            </div>

            <div className="register-footer">
              <p>© 2025 SGI - Universidad Nacional Agraria de la Selva</p>
            </div>
          </div>

          {/* Modal flotante de verificación de código */}
          {step === 2 && (
            <div className="modal-overlay">
              <div className="modal-content animate-fade-in">
                <div className="modal-header">
                  <h2 className="modal-title">Verificación de Correo</h2>
                  <p className="modal-subtitle">
                    Ingresa el código de 6 dígitos enviado a <strong style={{ color: '#1a365d' }}>{getFullEmail()}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="register-form">
                  {error && (
                    <div className="register-error-alert animate-fade-in" role="alert">
                      <span className="alert-icon">⚠️</span>
                      <span className="alert-text">{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="register-success-alert animate-fade-in" role="alert">
                      <span className="alert-icon">✉️</span>
                      <span className="alert-text">{successMessage}</span>
                    </div>
                  )}

                  {/* Código de verificación */}
                  <div className="form-group">
                    <label htmlFor="verificationCode" className="form-label">Código de Verificación</label>
                    <div className="code-input-row">
                      <input
                        type="text"
                        id="verificationCode"
                        maxLength={6}
                        className="form-input-custom code-input"
                        placeholder="------"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        disabled={isSubmitting}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={handleResendCode} 
                        className="btn-resend-inline" 
                        disabled={isSubmitting}
                      >
                        Reenviar
                      </button>
                    </div>
                  </div>

                  <div className="modal-actions-row">
                    <button 
                      type="button" 
                      onClick={() => {
                        setStep(1);
                        setError(null);
                        setSuccessMessage(null);
                      }} 
                      className="register-secondary-btn-custom" 
                      disabled={isSubmitting}
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="register-submit-btn-custom"
                      disabled={isSubmitting || verificationCode.length !== 6}
                      style={{ marginTop: 0 }}
                    >
                      {isSubmitting ? <span className="btn-spinner"></span> : <span>Verificar</span>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
  );
};

export default RegisterPage;
