import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DashboardContainer.css';
import { Sidebar } from '../../layout/Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

interface DashboardContainerProps {
  children?: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ children }) => {
  const { t } = useTranslation('dashboard');
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
            aria-label={t('dashboard:dashboardContainer.openMenu')}
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
          <main id="main-content" className="sgi-main-content animate-fade-in">
            {children || <Outlet />}
          </main>

          <footer className="sgi-dashboard-footer">
            <p>{t('dashboard:dashboardContainer.footer')}</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
