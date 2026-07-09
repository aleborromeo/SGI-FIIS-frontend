import React, { useState } from 'react';
import './DashboardContainer.css';
import { Sidebar } from '../../layout/Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

interface DashboardContainerProps {
  children?: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="sgi-dashboard-wrapper">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

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

        <div className="sgi-content-scroll">
          <main className="sgi-main-content animate-fade-in">
            {children || <Outlet />}
          </main>

          <footer className="sgi-dashboard-footer">
            <p>© 2026 Sistema de Gestión de Investigación FIIS - Universidad Nacional Agraria de la Selva</p>
          </footer>
        </div>
        {/* Contenido Principal */}
        <main className="sgi-main-content animate-fade-in" style={{ maxWidth: '95%' }}>
          {children || <Outlet />}
        </main>

        <footer className="sgi-dashboard-footer">
          <p>© 2026 Sistema de Gestión de Investigación FIIS - Universidad Nacional Agraria de la Selva</p>
        </footer>
      </div>
    </div>
  );
};