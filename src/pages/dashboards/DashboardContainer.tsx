import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './DashboardContainer.css';

interface DashboardContainerProps {
  children: ReactNode;
}

import { type ReactNode } from 'react';

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children }) => {
  const { user, currentRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string | null): { label: string; colorClass: string; icon: string } => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador', colorClass: 'role-admin', icon: '🔑' };
      case 'ESTUDIANTE':
        return { label: 'Estudiante / Tesista', colorClass: 'role-student', icon: '📖' };
      case 'DOCENTE_INVESTIGADOR':
        return { label: 'Docente Investigador', colorClass: 'role-teacher', icon: '🔬' };
      case 'COORDINADOR_GRUPO':
        return { label: 'Coordinador de Grupo', colorClass: 'role-coordinator', icon: '👥' };
      case 'DIRECTOR_INVESTIGACION':
        return { label: 'Director de Investigación', colorClass: 'role-director', icon: '🏢' };
      case 'DECANO':
        return { label: 'Decano', colorClass: 'role-dean', icon: '⚖️' };
      case 'EVALUADOR':
        return { label: 'Evaluador', colorClass: 'role-evaluator', icon: '📋' };
      default:
        return { label: 'Usuario', colorClass: 'role-user', icon: '👤' };
    }
  };

  const roleInfo = getRoleLabel(currentRole);

  return (
    <div className="sgi-dashboard-layout">
      {/* Barra de Navegación Superior Premium */}
      <header className="sgi-navbar">
        <div className="sgi-navbar-brand">
          <span className="unas-logo-mini">🎓</span>
          <div className="brand-texts">
            <h1 className="brand-title">SGI-FIIS</h1>
            <span className="brand-subtitle">Facultad de Ingeniería en Informática y Sistemas</span>
          </div>
        </div>

        <div className="sgi-navbar-user-panel">
          {/* Indicador de Rol (Gestalt - Similitud / Nielsen - Visibilidad) */}
          <div className={`role-badge ${roleInfo.colorClass}`}>
            <span className="role-icon">{roleInfo.icon}</span>
            <span className="role-text">{roleInfo.label}</span>
          </div>

          <div className="user-details-wrapper">
            <div className="user-avatar">
              {user ? `${user.firstNames.charAt(0)}${user.lastNames.charAt(0)}` : 'US'}
            </div>
            <div className="user-text-info">
              <span className="user-name">{user ? `${user.firstNames} ${user.lastNames}` : 'Cargando...'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="sgi-logout-btn" title="Cerrar Sesión">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Salir</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="sgi-main-content">
        <div className="sgi-content-card animate-fade-in">
          {children}
        </div>
      </main>

      <footer className="sgi-dashboard-footer">
        <p>© 2026 Sistema de Gestión de Investigación FIIS - Universidad Nacional Agraria de la Selva</p>
      </footer>
    </div>
  );
};
