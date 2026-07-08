import React from 'react';
import { LayoutDashboard, FileText, BarChart2, History, Settings, LogOut, Users, GraduationCap, ClipboardCheck, AlertCircle, FileSearch, X, BookOpen } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navGroups = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
      { id: 'metrics', label: 'Métricas y Reportes', icon: <BarChart2 size={20} />, path: '/metrics' },
    ]
  },
  {
    title: 'Gestión Académica',
    items: [
      { id: 'proposals', label: 'Proyectos y Tesis', icon: <FileText size={20} />, path: '/projects' },
      { id: 'traceability', label: 'Trazabilidad', icon: <History size={20} />, path: '/thesis/plan/1' },
      { id: 'observations', label: 'Mis Observaciones', icon: <AlertCircle size={20} />, path: '/observations/panel' },
    ]
  },
  {
    title: 'Evaluación y Revisión',
    items: [
      { id: 'evaluations', label: 'Mis Evaluaciones', icon: <ClipboardCheck size={20} />, path: '/evaluations/my-evaluations' },
      { id: 'progress', label: 'Revisión Informes', icon: <FileSearch size={20} />, path: '/progressreports/review' },
    ]
  },
  {
    title: 'Administración',
    items: [
      { id: 'users', label: 'Directorio', icon: <Users size={20} />, path: '/users' },
      { id: 'groups', label: 'Grupos Inv.', icon: <Users size={20} />, path: '/groups' },
      { id: 'lines', label: 'Líneas Inv.', icon: <BookOpen size={20} />, path: '/lines' },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, currentRole, logout } = React.useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string | null): string => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'ESTUDIANTE': return 'Estudiante / Tesista';
      case 'DOCENTE_INVESTIGADOR': return 'Docente Investigador';
      case 'COORDINADOR_GRUPO': return 'Coordinador de Grupo';
      case 'DIRECTOR_INVESTIGACION': return 'Director de Investigación';
      case 'DECANO': return 'Decano';
      case 'EVALUADOR': return 'Evaluador';
      default: return 'Usuario';
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {/* Logo Area */}
        <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {/* Botón Cerrar (Solo en Móvil) */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 32, 69, 0.15)'
            }}>
              <GraduationCap size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-title-lg" style={{ color: 'var(--on-surface)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Investigación
              </h1>
              <span className="text-caption" style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                FIIS - UNAS
              </span>
            </div>
          </div>

          {/* Decorative Separator */}
          <div style={{
            height: '1px',
            width: '100%',
            background: 'linear-gradient(90deg, var(--outline-variant) 0%, transparent 100%)',
            opacity: 0.6
          }}></div>
        </div>

        {/* Main Navigation */}
        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          {navGroups.map((group, index) => (
            <div key={index}>
              <h3 className="text-caption" style={{ paddingLeft: '16px', marginBottom: '8px', color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {group.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (location.pathname.startsWith('/projects') && item.id === 'proposals');
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                        backgroundColor: isActive ? 'var(--primary-fixed)' : 'transparent',
                        textDecoration: 'none',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-container-low)';
                          e.currentTarget.style.color = 'var(--on-surface)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--on-surface-variant)';
                        }
                      }}
                    >
                      {item.icon}
                      <span className="text-body-md">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Navigation */}
        <div style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
          <div style={{ padding: '16px' }}>
            {/* User Profile Mini */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', marginBottom: '16px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user ? `${user.firstNames?.charAt(0) || ''}${user.lastNames?.charAt(0) || ''}` : 'US'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="text-label-md" style={{ color: 'var(--on-surface)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 700 }}>
                  {user ? (user.firstNames ? `${user.firstNames} ${user.lastNames}` : (user.email || 'Usuario')) : 'Cargando...'}
                </div>
                <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>{getRoleLabel(currentRole)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', width: '100%' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-highest)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Settings size={20} />
                <span className="text-body-md" style={{ fontWeight: 500 }}>Configuración</span>
              </button>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', width: '100%' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={20} />
                <span className="text-body-md" style={{ fontWeight: 500 }}>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
