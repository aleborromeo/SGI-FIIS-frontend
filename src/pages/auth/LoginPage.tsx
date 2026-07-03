import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LoginPage.css';
import frontisBg from '../../assets/images/frontis_fiis.png';
import universityIcon from '../../assets/images/icons8-universidad-50 (1).png';

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
      {/* Fondo difuminado usando la imagen de frontis */}
      <div 
        className="login-bg-blur" 
        style={{ backgroundImage: `url("${frontisBg}")` }}
      />
      <div className="login-overlay" />

      <div className="login-content-wrapper">
          <div className="login-card-container">
          <div className="login-card-header">
            <img src={universityIcon} alt="SGI Logo" className="login-logo-img" />
            <h1 className="login-logo-title">SGI</h1>
            <p className="login-logo-subtitle">Sistema de Gestión de Investigación</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Visibilidad del estado del sistema - Nielsen */}
            {(error || validationError) && (
              <div className="login-error-alert animate-fade-in" role="alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{validationError || error}</span>
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

            {/* Selector de Rol para prueba */}
            <div className="form-group">
              <label htmlFor="role" className="form-label">Rol de Prueba (Autocompletar)</label>
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
                  <option value="">Selecciona para autocompletar</option>
                  <option value="ADMIN">Administrador del sistema</option>
                  <option value="DIRECTOR_INVESTIGACION">Director de Investigación</option>
                  <option value="COORDINADOR_GRUPO">Coordinador de Grupo de Investigación</option>
                  <option value="DOCENTE_INVESTIGADOR">Docente Investigador</option>
                  <option value="ESTUDIANTE">Estudiante / Tesista</option>
                  <option value="DECANO">Decano de la Facultad</option>
                  <option value="EVALUADOR">Evaluador de Proyectos</option>
                </select>
                
              </div>
            </div>

            {/* Botón Iniciar Sesión con Icono */}
            <button
              type="submit"
              className="login-submit-btn-custom"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="login-card-footer-redirect">
            ¿No tienes una cuenta?
            <a 
              href="/register" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }} 
              className="forgot-password-link"
            >
              Regístrate
            </a>
          </div>
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
