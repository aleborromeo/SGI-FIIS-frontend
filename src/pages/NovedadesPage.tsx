import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WelcomePage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import { Globe, User, ChevronDown } from 'lucide-react';
import { callService } from '../services/callService';

// Import news images
import convocatoriasBg from '../assets/images/convocatorias.png';
import reconocimientoBg from '../assets/images/reconocimineto.png';
import congresosBg from '../assets/images/congresos.png';

export const NovedadesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [activeSection, setActiveSection] = useState('novedades-convocatorias');
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

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
            {language === 'es' ? 'Inicio' : 'Home'}
          </a>

          {/* Dropdown: Novedades */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{language === 'es' ? 'Novedades' : 'News'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-convocatorias'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Convocatorias' : 'Announcements'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-reconocimientos'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Reconocimiento' : 'Recognition'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-congresos'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Congresos' : 'Congresses'}
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
              <span>{language === 'es' ? 'Sobre nosotros' : 'About us'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'quienes-somos' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Quiénes somos' : 'Who we are'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'lineas-investigacion' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Líneas de investigación' : 'Research lines'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'grupos-investigacion' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Grupos' : 'Groups'}
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
              <span>{language === 'es' ? 'Contacto' : 'Contact'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/contacto', { state: { scrollToHash: 'contacto-form-section' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Correo' : 'Email'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/contacto', { state: { scrollToHash: 'whatsapp-contact-section' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'WhatsApp' : 'WhatsApp'}
              </a>
            </div>
          </div>

          {/* Botón: Envía tu investigación */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            className="nav-link btn-submit-research"
          >
            {language === 'es' ? 'Envía tu investigación' : 'Submit your research'}
          </a>
        </nav>

        <div className="welcome-navbar-actions">
          <button 
            type="button" 
            onClick={handleToggleLanguage} 
            className="btn-nav btn-language-selector"
            title={language === 'es' ? 'Cambiar idioma' : 'Change language'}
          >
            <Globe size={15} />
            <span>{language === 'es' ? 'Español' : 'English'}</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="btn-nav btn-login-navbar"
          >
            <User size={15} />
            <span>{language === 'es' ? 'Iniciar sesión' : 'Log In'}</span>
          </button>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <section className="welcome-about-fiis-section" style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        <div className="about-fiis-container">
          
          {/* Columna Izquierda: Novedades Stacked */}
          <div className="about-fiis-main-content">
            <div className="about-fiis-breadcrumbs">
              {language === 'es' ? 'Inicio » Novedades » Noticias de Investigación' : 'Home » News » Research Announcements'}
            </div>

            {/* Sección 1: Convocatorias */}
            {activeSection === 'novedades-convocatorias' && (
              <section id="novedades-convocatorias" className="about-stacked-section">
                <h2 className="about-fiis-title" style={{ marginBottom: '1.5rem' }}>
                  {language === 'es' ? 'Convocatorias Oficiales' : 'Official Announcements'}
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
                      {language === 'es' ? 'No hay convocatorias vigentes en este momento.' : 'There are no active announcements at this time.'}
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
                            <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff', margin: 0 }}>CONVOCATORIA</div>
                            <span style={{ 
                              color: '#ffffff', 
                              backgroundColor: 'rgba(15, 23, 42, 0.65)', 
                              padding: '4px 10px', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600 
                            }}>
                              Código: CONV-{call.id}
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
                              <span><strong>{language === 'es' ? 'Vigencia:' : 'Duration:'}</strong> {call.startDate} {language === 'es' ? 'al' : 'to'} {call.endDate}</span>
                              <span>
                                <strong>{language === 'es' ? 'Estado:' : 'Status:'}</strong>{' '}
                                <span style={{ 
                                  color: isOpen ? '#166534' : '#991b1b', 
                                  fontWeight: 700,
                                  backgroundColor: isOpen ? '#dcfce7' : '#fee2e2',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem'
                                }}>
                                  {language === 'es' 
                                    ? (isOpen ? 'Abierta' : call.status === 'CERRADA' ? 'Cerrada' : 'Finalizada')
                                    : (isOpen ? 'Open' : call.status === 'CERRADA' ? 'Closed' : 'Finished')
                                  }
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
                              {language === 'es' 
                                ? (isOpen ? 'Postular e Iniciar Trámite' : 'Postulación Cerrada') 
                                : (isOpen ? 'Apply & Start Process' : 'Applications Closed')
                              }
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
                  {language === 'es' ? 'Reconocimiento y Logros Científicos' : 'Scientific Achievements & Recognition'}
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
                    <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff' }}>RECONOCIMIENTO</div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                      {language === 'es' ? 'Docentes premiados por patentes de innovación tecnológica' : 'Professors recognized for technological innovation patents'}
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                      {language === 'es'
                        ? 'Felicitamos a nuestros docentes investigadores reconocidos a nivel nacional por sus patentes de invención registradas ante INDECOPI y su alto impacto científico en informática. Sus investigaciones en algoritmos predictivos aplicados a la agricultura de precisión representan un hito para la universidad.'
                        : 'We congratulate our researcher professors recognized nationwide for their invention patents registered with INDECOPI and their high scientific impact in computing. Their research on predictive algorithms applied to precision agriculture represents a milestone for the university.'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.88rem', color: '#64748b' }}>
                      <span><strong>{language === 'es' ? 'Fecha de publicación:' : 'Publishing Date:'}</strong> 28 de Junio, 2026</span>
                      <span><strong>{language === 'es' ? 'Categoría:' : 'Category:'}</strong> {language === 'es' ? 'Patente / Innovación' : 'Patent / Innovation'}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Sección 3: Congresos */}
            {activeSection === 'novedades-congresos' && (
              <section id="novedades-congresos" className="about-stacked-section" style={{ paddingBottom: '4rem' }}>
                <h2 className="about-fiis-title" style={{ marginBottom: '1.5rem' }}>
                  {language === 'es' ? 'Próximos Congresos y Eventos' : 'Upcoming Congresses & Events'}
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
                    <div className="about-card-badge" style={{ backgroundColor: '#1a365d', color: '#ffffff' }}>CONGRESOS</div>
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                      {language === 'es' ? 'Congreso Internacional de Ingeniería de Sistemas (CIIS 2026)' : 'International Congress of Systems Engineering (CIIS 2026)'}
                    </h3>
                    <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                      {language === 'es'
                        ? 'Inscríbete en los talleres, ponencias internacionales y mesas redondas programadas para el evento académico más grande del año en la UNAS. Contaremos con expositores de talla mundial de Google, AWS y universidades líderes de Latinoamérica para debatir sobre inteligencia artificial y ciberseguridad.'
                        : 'Register for workshops, international presentations, and roundtables scheduled for the largest academic event of the year at UNAS. We will feature world-class speakers from Google, AWS, and leading Latin American universities to debate artificial intelligence and cybersecurity.'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.88rem', color: '#64748b' }}>
                      <span><strong>{language === 'es' ? 'Fecha del evento:' : 'Event Date:'}</strong> 15 de Junio, 2026</span>
                      <span><strong>{language === 'es' ? 'Modalidad:' : 'Modality:'}</strong> {language === 'es' ? 'Híbrida (Presencial / Virtual)' : 'Hybrid (In-person / Virtual)'}</span>
                    </div>

                    <button 
                      onClick={() => navigate('/login')} 
                      className="btn-submit-contact"
                      style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 1.5rem' }}
                    >
                      {language === 'es' ? 'Inscribirse al Evento' : 'Register for Event'}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Sidebar Indices Sticky */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">{language === 'es' ? 'Novedades' : 'News'}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#novedades-convocatorias" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-convocatorias'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-convocatorias' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Convocatorias' : 'Announcements'}
                </a>
              </li>
              <li>
                <a 
                  href="#novedades-reconocimientos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-reconocimientos'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-reconocimientos' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Reconocimiento' : 'Recognition'}
                </a>
              </li>
              <li>
                <a 
                  href="#novedades-congresos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('novedades-congresos'); }} 
                  className={`sidebar-link ${activeSection === 'novedades-congresos' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Congresos' : 'Congresses'}
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
            title={language === 'es' ? 'Volver arriba' : 'Back to top'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div className="footer-premium-content">
          <div className="footer-columns-wrapper" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="footer-column">
              <h4>Facultad</h4>
              <ul>
                <li><a href="https://www.sistemasunas.edu.pe/nuestra-facultad/decanatura" target="_blank" rel="noopener noreferrer">Decanato FIIS</a></li>
                <li><a href="https://www.sistemasunas.edu.pe/departamentos-academicos" target="_blank" rel="noopener noreferrer">Departamentos Académicos</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Investigación</h4>
              <ul>
                <li><a href="https://investigacion.unas.edu.pe" target="_blank" rel="noopener noreferrer">Dirección General</a></li>
                <li><a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer">Documentos Normativos</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Soporte</h4>
              <ul>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Preguntas Frecuentes</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Manual de Usuario</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom-copyright">
          <p>© 2026 SGI - Facultad de Ingeniería en Informática y Sistemas - UNAS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
