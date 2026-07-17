import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WelcomePage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { User, ChevronDown } from 'lucide-react';
import { callService } from '../services/callService';

// Import news images
import convocatoriasBg from '../assets/images/convocatorias.png';
import reconocimientoBg from '../assets/images/reconocimineto.png';
import congresosBg from '../assets/images/congresos.png';

export const NovedadesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('public');
  useLanguage();
  const [activeSection, setActiveSection] = useState('novedades-convocatorias');
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Escuchar navegación externa y cambiar sección
  useEffect(() => {
    const targetHash = (location.state as any)?.scrollToHash;
    if (targetHash) {
      setActiveSection(targetHash);
    }
    window.scrollTo(0, 0);
  }, [location]);

  // Cargar convocatorias del backend
  useEffect(() => {
    setLoading(true);
    callService.getAll()
      .then((data) => {
        // Ordenar: ABIERTA primero, luego id descendente
        const sorted = [...data].sort((a, b) => {
          if (a.status === 'ABIERTA' && b.status !== 'ABIERTA') return -1;
          if (a.status !== 'ABIERTA' && b.status === 'ABIERTA') return 1;
          return b.id - a.id;
        });
        setCalls(sorted);
      })
      .catch((err) => console.error('Error al obtener convocatorias:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="welcome-page-container">
      {/* Navbar Superior */}
      <header className="welcome-navbar">
        <div className="welcome-brand">
          <img src={universityIcon} alt="SGI Logo" className="welcome-logo-img-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>

        {/* Enlaces de Navegación */}
        <nav className="welcome-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="nav-link">
            {t('nav.home')}
          </a>

          {/* Dropdown: Novedades */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{t('nav.news')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-convocatorias'); }}
                className="dropdown-item"
              >
                {t('nav.convocatorias')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-reconocimientos'); }}
                className="dropdown-item"
              >
                {t('nav.reconocimiento')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-congresos'); }}
                className="dropdown-item"
              >
                {t('nav.congresos')}
              </a>
            </div>
          </div>

          {/* Dropdown: Sobre nosotros */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi'); }}
              className="nav-link dropdown-toggle"
            >
              <span>{t('nav.aboutUs')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'quienes-somos' } }); }}
                className="dropdown-item"
              >
                {t('nav.quienesSomos')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'lineas-investigacion' } }); }}
                className="dropdown-item"
              >
                {t('nav.lineasInvestigacion')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'grupos-investigacion' } }); }}
                className="dropdown-item"
              >
                {t('nav.grupos')}
              </a>
            </div>
          </div>

          {/* Dropdown: Contacto */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/contacto'); }}
              className="nav-link dropdown-toggle"
            >
              <span>{t('nav.contacto')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/contacto', { state: { scrollToHash: 'contacto-form-section' } }); }}
                className="dropdown-item"
              >
                {t('nav.correo')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/contacto', { state: { scrollToHash: 'whatsapp-contact-section' } }); }}
                className="dropdown-item"
              >
                {t('nav.whatsapp')}
              </a>
            </div>
          </div>

          {/* Botón: Envía tu investigación */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            className="nav-link btn-submit-research"
          >
            {t('nav.submitResearch')}
          </a>
        </nav>

        <div className="welcome-navbar-actions">
          <LanguageSwitcher variant="button" className="btn-nav btn-language-selector" />
          
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="btn-nav btn-login-navbar"
          >
            <User size={15} />
            <span>{t('nav.login')}</span>
          </button>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <section className="welcome-about-fiis-section" style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        <div className="about-fiis-container">
          
          {/* Columna Izquierda: Novedades Stacked */}
          <div className="about-fiis-main-content">
            <div className="about-fiis-breadcrumbs">
              {t('news.breadcrumb')}
            </div>

            {/* Sección 1: Convocatorias */}
            {activeSection === 'novedades-convocatorias' && (
              <section id="novedades-convocatorias" className="about-stacked-section">
                <h2 className="about-fiis-title" style={{ marginBottom: '1.5rem' }}>
                  {t('news.officialAnnouncements')}
                </h2>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #1a365d',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : calls.length === 0 ? (
                  <div className="about-info-card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>
                      {t('news.noActiveAnnouncements')}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {calls.map((call) => {
                      const isOpen = call.status === 'ABIERTA';
                      return (
                        <div key={call.id} className="about-info-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                          <div style={{
                            height: '240px',
                            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%), url(${convocatoriasBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            padding: '2rem',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between'
                          }}>
                            <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff', margin: 0 }}>{t('news.convocatoriaBadge')}</div>
                            <span style={{ 
                              color: '#ffffff', 
                              backgroundColor: 'rgba(15, 23, 42, 0.65)', 
                              padding: '4px 10px', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600 
                            }}>
                              {t('news.code', { id: call.id })}
                            </span>
                          </div>
                          <div style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                              {call.title}
                            </h3>
                            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0', whiteSpace: 'pre-line' }}>
                              {call.description}
                            </p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', fontSize: '0.88rem', color: '#64748b' }}>
                              <span><strong>{t('news.duration')}</strong> {call.startDate} {t('news.to')} {call.endDate}</span>
                              <span>
                                <strong>{t('news.status')}</strong>{' '}
                                <span style={{ 
                                  color: isOpen ? '#166534' : '#991b1b', 
                                  fontWeight: 700,
                                  backgroundColor: isOpen ? '#dcfce7' : '#fee2e2',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem'
                                }}>
                                  {isOpen ? t('news.open') : call.status === 'CERRADA' ? t('news.closed') : t('news.finished')}
                                </span>
                              </span>
                            </div>

                            <button 
                              onClick={() => isOpen && navigate('/login')} 
                              className="btn-submit-contact"
                              disabled={!isOpen}
                              style={{ 
                                marginTop: '1.5rem', 
                                width: 'auto', 
                                padding: '0.75rem 1.5rem',
                                opacity: isOpen ? 1 : 0.5,
                                cursor: isOpen ? 'pointer' : 'not-allowed',
                                background: isOpen ? 'linear-gradient(135deg, #1e3a8a 0%, #1a365d 100%)' : '#cbd5e1'
                              }}
                            >
                              {isOpen ? t('news.applyStartProcess') : t('news.applicationsClosed')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Sección 2: Reconocimientos */}
            {activeSection === 'novedades-reconocimientos' && (
              <section id="novedades-reconocimientos" className="about-stacked-section">
                <h2 className="about-fiis-title" style={{ marginBottom: '1.5rem' }}>
                  {t('news.recognitionTitle')}
                </h2>
                
                <div className="about-info-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{
                    height: '240px',
                    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%), url(${reconocimientoBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '2rem',
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}>
                    <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff' }}>{t('news.recognitionBadge')}</div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                      {t('news.recognitionSubtitle')}
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                      {t('news.recognitionDescription')}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.88rem', color: '#64748b' }}>
                      <span><strong>{t('news.publishingDate')}</strong> 28 de Junio, 2026</span>
                      <span><strong>{t('news.category')}</strong> {t('news.patentInnovation')}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Sección 3: Congresos */}
            {activeSection === 'novedades-congresos' && (
              <section id="novedades-congresos" className="about-stacked-section" style={{ paddingBottom: '4rem' }}>
                <h2 className="about-fiis-title" style={{ marginBottom: '1.5rem' }}>
                  {t('news.upcomingCongresses')}
                </h2>
                
                <div className="about-info-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{
                    height: '240px',
                    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%), url(${congresosBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '2rem',
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}>
                    <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff' }}>{t('news.congressBadge')}</div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                      {t('news.congressTitle')}
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                      {t('news.congressDescription')}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.88rem', color: '#64748b' }}>
                      <span><strong>{t('news.eventDate')}</strong> 15 de Junio, 2026</span>
                      <span><strong>{t('news.modality')}</strong> {t('news.hybrid')}</span>
                    </div>

                    <button 
                      onClick={() => navigate('/login')} 
                      className="btn-submit-contact"
                      style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 1.5rem' }}
                    >
                      {t('news.registerForEvent')}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Sidebar Indices Sticky */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">{t('news.sidebarTitle')}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#novedades-convocatorias" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-convocatorias'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-convocatorias' ? 'active' : ''}`}
                >
                  {t('nav.convocatorias')}
                </a>
              </li>
              <li>
                <a 
                  href="#novedades-reconocimientos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-reconocimientos'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-reconocimientos' ? 'active' : ''}`}
                >
                  {t('nav.reconocimiento')}
                </a>
              </li>
              <li>
                <a 
                  href="#novedades-congresos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-congresos'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-congresos' ? 'active' : ''}`}
                >
                  {t('nav.congresos')}
                </a>
              </li>
            </ul>
          </aside>

        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer-premium">
        {/* Botón para subir (tipo chevron en el medio de la línea ploma) */}
        <div className="footer-scroll-top-container">
          <div className="footer-scroll-top-line" />
          <button
            className="footer-scroll-top-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title={t('footer.backToTop')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div className="footer-premium-content">
          <div className="footer-columns-wrapper" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="footer-column">
              <h4>{t('footer.faculty')}</h4>
              <ul>
                <li><a href="https://www.sistemasunas.edu.pe/nuestra-facultad/decanatura" target="_blank" rel="noopener noreferrer">{t('footer.decanatoFiis')}</a></li>
                <li><a href="https://www.sistemasunas.edu.pe/departamentos-academicos" target="_blank" rel="noopener noreferrer">{t('footer.departamentosAcademicos')}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t('footer.research')}</h4>
              <ul>
                <li><a href="https://investigacion.unas.edu.pe" target="_blank" rel="noopener noreferrer">{t('footer.direccionGeneral')}</a></li>
                <li><a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer">{t('footer.documentosNormativos')}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t('footer.support')}</h4>
              <ul>
                <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.faq')}</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>{t('footer.userManual')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom-copyright">
          <p>{t('footer.copyrightFull')}</p>
        </div>
      </footer>
    </div>
  );
};
