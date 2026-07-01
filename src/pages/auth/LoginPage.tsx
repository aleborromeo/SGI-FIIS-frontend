import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores globales al montar
  useEffect(() => {
    clearError();
  }, []);

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
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mapeo de roles para el auto-completado del asistente integrado
  const roleAccounts: Record<string, { email: string; label: string }> = {
    'ADMIN': { email: 'admin@unas.edu.pe', label: 'Administrador' },
    'DIRECTOR_INVESTIGACION': { email: 'ana.torres@unas.edu.pe', label: 'Director Investigación' },
    'COORDINADOR_GRUPO': { email: 'carlos.ramos@unas.edu.pe', label: 'Coordinador de Grupo' },
    'DOCENTE_INVESTIGADOR': { email: 'maria.gomez@unas.edu.pe', label: 'Docente Investigador' },
    'ESTUDIANTE': { email: 'jose.evaristo@unas.edu.pe', label: 'Estudiante / Tesista' },
    'DECANO': { email: 'luis.mendoza@unas.edu.pe', label: 'Decano' },
    'EVALUADOR': { email: 'jorge.castro@unas.edu.pe', label: 'Evaluador' }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    clearError();
    setValidationError(null);
    
    if (role && roleAccounts[role]) {
      setEmail(roleAccounts[role].email);
      setPassword('00000000'); // Contraseña por defecto
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        {/* Tarjeta de Inicio de Sesión - Gestalt: Región Común y Cierre */}
        <div className="login-card-container">
          <div className="login-card-header">
            <h2 className="login-title">Iniciar sesión</h2>
            <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Visibilidad del estado del sistema - Nielsen */}
            {(error || validationError) && (
              <div className="login-error-alert animate-fade-in" role="alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{validationError || error}</span>
              </div>
            )}

            {/* Input Correo - Proximidad */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Usuario o correo electrónico</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  className={`form-input ${validationError && !email ? 'input-error' : ''}`}
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Input Contraseña - Proximidad */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input ${validationError && !password ? 'input-error' : ''}`}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
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

            {/* Checkbox y Recordarme */}
            <div className="form-options-row">
              <label className="remember-me-label">
                <input type="checkbox" className="remember-me-checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Selector de Rol - Heurística: Reconocimiento antes que Recuerdo (Asistente Integrado) */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">Rol</label>
              <div className="select-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <select
                  id="role"
                  className="form-select"
                  value={selectedRole}
                  onChange={handleRoleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona tu rol</option>
                  <option value="ADMIN">Administrador del sistema</option>
                  <option value="DIRECTOR_INVESTIGACION">Director de Investigación</option>
                  <option value="COORDINADOR_GRUPO">Coordinador de Grupo de Investigación</option>
                  <option value="DOCENTE_INVESTIGADOR">Docente Investigador</option>
                  <option value="ESTUDIANTE">Estudiante / Tesista</option>
                  <option value="DECANO">Decano de la Facultad</option>
                  <option value="EVALUADOR">Evaluador de Proyectos</option>
                </select>
                <span className="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Botón Iniciar Sesión */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <span className="btn-spinner"></span>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>

            {/* Separador */}
            <div className="form-separator">o continuar con</div>

            {/* Botón continuar con Google */}
            <button
              type="button"
              className="google-login-btn"
              onClick={() => alert('Autenticación de Google no configurada en entorno local (Usa los roles de prueba).')}
              disabled={isSubmitting}
            >
              <svg className="google-icon-svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.53 2.87-2.14 5.31-4.57 6.94l7.1 5.51C43.46 36.56 46.5 30.93 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.51c-1.97 1.33-4.49 2.12-8.79 2.12-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </form>
        </div>

        {/* Footer Centrado */}
        <div className="login-card-footer">
          <p>© 2026 SGI-FIIS. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};
