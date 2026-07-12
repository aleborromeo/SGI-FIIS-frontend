import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css';
import frontisBg from '../../assets/images/frontis_fiis.png';
import userSesionIcon from '../../assets/images/user-sesion.jpg';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  // Estados para el captcha visual
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores globales al montar y generar captcha
  useEffect(() => {
    console.log('AuthContext value in LoginPage:', { login: typeof login, isAuthenticated, error, clearError: typeof clearError });
    clearError?.();
    generateCaptcha();
  }, []);

  const generateCaptcha = (keepError = false) => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
    if (!keepError) {
      setCaptchaError(false);
    }
    
    // Pequeño retardo para asegurar que el canvas está en el DOM
    setTimeout(() => {
      drawCaptcha(code);
    }, 50);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo del Captcha (degradado suave)
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido de fondo
    ctx.strokeStyle = 'rgba(26, 54, 93, 0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Puntos de ruido
    ctx.fillStyle = 'rgba(26, 54, 93, 0.12)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dibujar caracteres aleatorios con rotación y distorsión
    ctx.font = 'italic bold 22px "Courier New", Courier, monospace';
    ctx.textBaseline = 'middle';
    
    const startX = 20;
    const spacing = (canvas.width - 40) / (code.length - 1);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      // Alternancia de colores institucionales oscuros
      ctx.fillStyle = ['#1a365d', '#0f172a', '#1e3a8a', '#2563eb', '#1d4ed8'][Math.floor(Math.random() * 5)];
      const angle = (Math.random() - 0.5) * 0.4; // Inclinación aleatoria
      const yOffset = (Math.random() - 0.5) * 8; // Altura aleatoria

      ctx.save();
      ctx.translate(startX + i * spacing, canvas.height / 2 + yOffset);
      ctx.rotate(angle);
      // Centrar el texto en su eje
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  };

  const validateForm = (): boolean => {
    if (!email) {
      setValidationError('El correo institucional es obligatorio.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Por favor, ingrese un correo institucional válido.');
      return false;
    }
    if (!password) {
      setValidationError('La contraseña es obligatoria.');
      return false;
    }

    // Validar Captcha
    if (!userCaptchaInput) {
      setValidationError('El código de verificación es obligatorio.');
      return false;
    }
    if (userCaptchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      setValidationError(null); // Ocultar error genérico para mostrar el específico de captcha debajo
      generateCaptcha(true);
      return false;
    }

    // Validar políticas y privacidad
    if (!acceptedPolicies) {
      setValidationError('Debe aceptar las políticas y privacidad.');
      return false;
    }

    setValidationError(null);
    setCaptchaError(false);
    return true;
  };

  const getFriendlyErrorMessage = (errMsg: string | null) => {
    if (!errMsg) return null;
    const lower = errMsg.toLowerCase();
    
    // Validar inactivo
    if (
      lower.includes('inactive') ||
      lower.includes('inactivo') ||
      lower.includes('no activo') ||
      lower.includes('no está activo') ||
      lower.includes('desactivado') ||
      lower.includes('disabled')
    ) {
      return 'El usuario no está activo';
    }
    
    // Validar credenciales incorrectas
    if (
      lower.includes('credenciales') ||
      lower.includes('incorrecto') ||
      lower.includes('incorrecta') ||
      lower.includes('invalid') ||
      lower.includes('bad-credentials') ||
      lower.includes('unauthorized') ||
      lower.includes('no autorizado') ||
      lower.includes('contraseña')
    ) {
      return 'Usuario o contraseña incorrecto';
    }
    
    return errMsg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await login(email, password);
      if (response && response.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      // Si hay error en las credenciales, regeneramos el captcha por seguridad
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fondo difuminado usando la imagen de frontis */}
      <div 
        className="login-bg-blur" 
        style={{ backgroundImage: `url("${frontisBg}")` }}
      />
      <div className="login-overlay" />

      <div className="login-content-wrapper">
        <div className="login-card-container">
          
          {/* Botón de Regreso a Bienvenida */}
          <button 
            type="button"
            className="login-back-btn" 
            onClick={() => navigate('/')}
            title="Regresar al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="login-card-header">
            <img src={userSesionIcon} alt="Logo" className="login-logo-img" />
            <p className="login-logo-subtitle">Sistema de Gestión de Investigación</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Mensaje de Error Genérico / Credenciales */}
            {(error || validationError) && (
              <div className="login-error-alert animate-fade-in" role="alert">
                <div className="error-alert-icon-container">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                    <path d="M12 2L1 21h22L12 2z" />
                    <path d="M12 15.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm0-7.5a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z" fill="#fbebeb" />
                  </svg>
                </div>
                <div className="error-alert-content">
                  <div className="error-alert-title">error</div>
                  <div className="error-alert-message">{getFriendlyErrorMessage(validationError || error)}</div>
                </div>
              </div>
            )}

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
                  className={`form-input-custom ${validationError && !email ? 'input-error' : ''}`}
                  placeholder="ejemplo@unas.edu.pe"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                    clearError?.();
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Input Contraseña */}
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
                  className={`form-input-custom ${validationError && !password ? 'input-error' : ''}`}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                    clearError?.();
                  }}
                  disabled={isSubmitting}
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

            {/* Captcha Visual */}
            <div className="form-group">
              <label className="form-label">Código de seguridad</label>
              <div className="captcha-display-group">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                <div className="captcha-canvas-container-static">
                  <canvas ref={canvasRef} width="220" height="40" className="captcha-canvas" />
                </div>
              </div>
            </div>

            {/* Input Captcha */}
            <div className="form-group">
              <label htmlFor="captchaInput" className="form-label">Código de verificación</label>
              <div className="input-group-custom">
                <span className="input-icon-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="captchaInput"
                  className={`form-input-custom ${captchaError ? 'input-error' : ''}`}
                  placeholder="Cod. Verificacion"
                  value={userCaptchaInput}
                  onChange={(e) => {
                    setUserCaptchaInput(e.target.value);
                    if (captchaError) setCaptchaError(false);
                    clearError?.();
                  }}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>
              {captchaError && (
                <p className="captcha-error-text-simple animate-fade-in">Código de verificación incorrecto</p>
              )}
            </div>

            {/* Checkbox y Aceptar políticas y privacidad */}
            <div className="form-options-row">
              <label className="policies-label">
                <input 
                  type="checkbox" 
                  className="policies-checkbox" 
                  checked={acceptedPolicies}
                  onChange={(e) => {
                    setAcceptedPolicies(e.target.checked);
                    if (validationError) setValidationError(null);
                    clearError?.();
                  }}
                  disabled={isSubmitting}
                />
                <span>Aceptar políticas y privacidad</span>
              </label>
              <div className="forgot-password-container">
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')} 
                  className="forgot-password-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              className="login-submit-btn-custom"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                  </svg>
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Centrado */}
        <div className="login-card-footer">
          <p>© 2025 SGI - Universidad Nacional Agraria de la Selva</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
