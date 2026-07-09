import React, { useContext, useState } from 'react';
import './DashboardContainer.css';
import { Sidebar } from '../../layout/Sidebar';
import { Menu, GraduationCap, Settings, LogOut } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../context/AuthContext';

interface DashboardContainerProps {
  children?: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentRole, logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const getRoleLabel = (role: string | null): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'ESTUDIANTE':
        return 'Estudiante / Tesista';
      case 'DOCENTE_INVESTIGADOR':
        return 'Docente Investigador';
      case 'COORDINADOR_GRUPO':
        return 'Coordinador de Grupo';
      case 'DIRECTOR_INVESTIGACION':
        return 'Director de Investigación';
      case 'DECANO':
        return 'Decano';
      case 'EVALUADOR':
        return 'Evaluador';
      default:
        return 'Usuario';
    }
  };

  const getUserInitials = (): string => {
    if (!user) return 'US';

    const firstName = user.firstNames?.charAt(0) ?? '';
    const lastName = user.lastNames?.charAt(0) ?? '';
    const initials = `${firstName}${lastName}`.trim();

    return initials || 'US';
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'Cargando...';

    if (user.firstNames) {
      return `${user.firstNames} ${user.lastNames ?? ''}`.trim();
    }

    return user.email || 'Usuario';
  };

  const getSectionLabel = (): string => {
    if (location.pathname.startsWith('/metrics')) return 'Métricas y Reportes';
    if (location.pathname.startsWith('/projects')) return 'Proyectos y Tesis';
    if (location.pathname.startsWith('/thesis')) return 'Trazabilidad';
    if (location.pathname.startsWith('/observations')) return 'Observaciones';
    if (location.pathname.startsWith('/evaluations')) return 'Evaluaciones';
    if (location.pathname.startsWith('/progressreports')) return 'Revisión de Informes';
    if (location.pathname.startsWith('/groups')) return 'Grupos de Investigación';
    if (location.pathname.startsWith('/lines')) return 'Líneas de Investigación';
    return 'Dashboard';
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sgi-dashboard-wrapper">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="sgi-dashboard-layout">
        <div className="sgi-mobile-topbar">
          <button
            className="sgi-mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          <div className="sgi-mobile-brand">
            <div className="unas-logo-mini-mobile">
              <GraduationCap size={20} color="white" />
            </div>
            <span className="brand-title-mobile">SGI-FIIS</span>
          </div>
        </div>

        <header className="sgi-desktop-topbar">
          <div className="sgi-topbar-left">
            <div>
              <div className="sgi-topbar-system">Panel institucional</div>
              <div className="sgi-topbar-section">{getSectionLabel()}</div>
            </div>
          </div>

          <div className="sgi-topbar-actions">
            {settingsMessage && (
              <div className="sgi-topbar-message">
                {settingsMessage}
              </div>
            )}

            <div className="sgi-user-chip">
              <div className="sgi-user-avatar">
                {getUserInitials()}
              </div>

              <div className="sgi-user-info">
                <div className="sgi-user-name">{getUserDisplayName()}</div>
                <div className="sgi-user-role">{getRoleLabel(currentRole)}</div>
              </div>
            </div>

            <button
              type="button"
              className="sgi-topbar-button"
              onClick={() => {
                setSettingsMessage('Configuración general pendiente de integración.');
                setTimeout(() => setSettingsMessage(null), 3000);
              }}
            >
              <Settings size={17} />
              Configuración
            </button>

            <button
              type="button"
              className="sgi-topbar-button danger"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="sgi-content-scroll">
          <main className="sgi-main-content animate-fade-in">
            {children || <Outlet />}
          </main>

          <footer className="sgi-dashboard-footer">
            <p>© 2026 Sistema de Gestión de Investigación FIIS - Universidad Nacional Agraria de la Selva</p>
          </footer>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="sgi-logout-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="sgi-logout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sgi-logout-icon">
              <LogOut size={26} />
            </div>

            <h2 className="sgi-logout-title">
              ¿Cerrar sesión?
            </h2>

            <p className="sgi-logout-text">
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </p>

            <div className="sgi-logout-actions">
              <button
                type="button"
                className="sgi-modal-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="sgi-modal-confirm"
                onClick={confirmLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};