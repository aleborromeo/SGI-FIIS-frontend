import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import './WelcomePage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import { User, ChevronDown } from 'lucide-react';

export const SobreSgiPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('public');
  useLanguage();
  const [activeSection, setActiveSection] = useState('quienes-somos');

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

  // Datos de Líneas de Investigación
  const researchLinesDetail = [
    {
      title: 'Computación',
      bases: 'El estudio formal de los fundamentos teóricos de la computación, desarrollo de algoritmos de alta complejidad y modelado científico-matemático.',
      areas: ['Teoría de la computación', 'Algorítmica avanzada', 'Optimización matemática', 'Computación de alto rendimiento (HPC)']
    },
    {
      title: 'Ingeniería de Software',
      bases: 'La aplicación de métodos sistemáticos, disciplinados y cuantificables al diseño, desarrollo, operación y mantenimiento del software.',
      areas: ['Calidad y pruebas de software', 'Arquitectura de sistemas complejos', 'Metodologías ágiles de desarrollo', 'DevOps e integración continua']
    },
    {
      title: 'Inteligencia Artificial',
      bases: 'El desarrollo de modelos informáticos y agentes autónomos capaces de aprender de la experiencia, percibir patrones y tomar decisiones inteligentes.',
      areas: ['Aprendizaje profundo (Deep Learning)', 'Procesamiento de lenguaje natural (NLP)', 'Visión computacional', 'Robótica y automatización']
    },
    {
      title: 'Ciencia de Datos',
      bases: 'La extracción de conocimiento predictivo y descriptivo a partir de grandes conjuntos de datos estructurados y no estructurados.',
      areas: ['Minería de datos (Data Mining)', 'Big Data y almacenamiento masivo', 'Visualización avanzada de información', 'Inteligencia de negocios (BI)']
    },
    {
      title: 'Redes y Telecomunicaciones',
      bases: 'El diseño y optimización de infraestructuras de comunicación digital para garantizar la transferencia segura y eficiente de datos.',
      areas: ['Internet de las Cosas (IoT)', 'Computación en la nube (Cloud Computing)', 'Seguridad y protocolos de red', 'Redes definidas por software (SDN)']
    },
    {
      title: 'Ciberseguridad',
      bases: 'La salvaguarda de activos de información mediante la protección de redes, sistemas de hardware y software contra ataques cibernéticos y accesos no autorizados.',
      areas: ['Criptografía aplicada', 'Hacking ético y análisis forense', 'Gestión de incidentes y riesgos TI', 'Seguridad en aplicaciones web y móviles']
    }
  ];

  // Datos de Grupos de Investigación
  const researchGroupsDetail = [
    {
      codigo: 'GINSOFT',
      nombre: 'Grupo de Investigación en Ingeniería de Software',
      bases: 'Se enfoca en la optimización de procesos de software, la adopción de arquitecturas de software robustas y escalables y la aplicación de metodologías de calidad internacional.',
      lineas: 'Ingeniería de Software',
      investigaciones: 18
    },
    {
      codigo: 'RESEGTI',
      nombre: 'Red de Seguridad y Gestión de TI',
      bases: 'Especializado en ciberseguridad, gestión de riesgos de tecnologías de información, auditoría de sistemas e implementación de marcos de gobernanza TI.',
      lineas: 'Ciberseguridad, Redes y Telecomunicaciones',
      investigaciones: 12
    },
    {
      codigo: 'GISI',
      nombre: 'Grupo de Investigación en Sistemas de Información',
      bases: 'Investiga el diseño y el impacto estratégico de los sistemas de información en la gestión empresarial, la reingeniería de procesos y soluciones ERP/CRM.',
      lineas: 'Ciencia de Datos, Computación',
      investigaciones: 15
    },
    {
      codigo: 'CICO',
      nombre: 'Círculo de Computación',
      bases: 'Dedicado al entrenamiento en programación competitiva, el diseño de algoritmos avanzados de grafos, estructuras de datos complejas y teoría computacional.',
      lineas: 'Computación, Inteligencia Artificial',
      investigaciones: 22
    },
    {
      codigo: 'EAP',
      nombre: 'Estadística Aplicada',
      bases: 'Aplica el análisis de regresión, diseño de experimentos, series de tiempo y modelos matemáticos aplicados a la agricultura, economía y ecología.',
      lineas: 'Ciencia de Datos',
      investigaciones: 8
    },
    {
      codigo: 'MAP',
      nombre: 'Matemática Aplicada',
      bases: 'Estudia métodos numéricos, optimización convexa, ecuaciones diferenciales y simulación por computadora para la resolución de problemas físicos y de ingeniería.',
      lineas: 'Computación',
      investigaciones: 10
    },
    {
      codigo: 'EU',
      nombre: 'Emprendimiento Universitario',
      bases: 'Investiga y promueve la innovación tecnológica, el desarrollo de modelos de negocio digitales y la incubación de startups y spin-offs de base científica.',
      lineas: 'Ingeniería de Software',
      investigaciones: 6
    }
  ];

  return (
    <div className="welcome-page-container">
      {/* Barra de navegación superior en Azul Normal */}
      <header className="welcome-navbar">
        <div className="welcome-brand">
          <img src={universityIcon} alt="SGI Logo" className="welcome-logo-img-mini" />
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
              onClick={(e) => { e.preventDefault(); navigate('/novedades'); }}
              className="nav-link dropdown-toggle"
            >
              <span>{t('nav.news')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-convocatorias' } }); }}
                className="dropdown-item"
              >
                {t('nav.announcements')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-reconocimientos' } }); }}
                className="dropdown-item"
              >
                {t('nav.recognition')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-congresos' } }); }}
                className="dropdown-item"
              >
                {t('nav.congresses')}
              </a>
            </div>
          </div>

          {/* Dropdown: Sobre nosotros */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{t('nav.aboutUs')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('quienes-somos'); }}
                className="dropdown-item"
              >
                {t('nav.whoWeAre')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('lineas-investigacion'); }}
                className="dropdown-item"
              >
                {t('nav.researchLines')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('grupos-investigacion'); }}
                className="dropdown-item"
              >
                {t('nav.groups')}
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
          <LanguageSwitcher variant="button" />
          
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

      {/* Sección Sobre nosotros (Estilo Frontiers) */}
      <section className="welcome-about-fiis-section" style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Cabecera Principal */}
        <div className="about-fiis-header-wrapper">
          <div className="about-fiis-breadcrumbs">
            {t('about.breadcrumbs')}
          </div>
          <h1 className="about-fiis-main-page-title">
            {activeSection === 'quienes-somos' && t('about.pageTitleWhoWeAre')}
            {activeSection === 'lineas-investigacion' && t('about.pageTitleResearchLines')}
            {activeSection === 'grupos-investigacion' && t('about.pageTitleResearchGroups')}
          </h1>
        </div>

        <div className="about-fiis-container">
          
          {/* Columna Izquierda: Contenido Principal Stacked */}
          <div className="about-fiis-main-content">

            {/* Sección 1: Quiénes somos */}
            {activeSection === 'quienes-somos' && (
              <section id="quienes-somos" className="about-stacked-section">
                
                <h3 className="sgi-article-section-title">
                  {t('about.whereItAllBegan')}
                </h3>
                
                <article className="sgi-article">
                  <div className="sgi-article-body">
                    <p>
                      {t('about.history1')}
                    </p>

                    <p>
                      {t('about.history2')}
                    </p>

                    <p>
                      {t('about.history3')}
                    </p>
                  </div>
                </article>
              </section>
            )}

            {/* Sección 2: Líneas de Investigación */}
            {activeSection === 'lineas-investigacion' && (
              <section id="lineas-investigacion" className="about-stacked-section">
                <p className="about-tab-description">
                  {t('about.researchLinesDescription')}
                </p>

                <div className="about-tabs-grid-container">
                  {researchLinesDetail.map((line) => (
                    <div key={line.title} className="about-info-card">
                      <div className="about-card-header-row">
                        <div className="about-card-badge">{t('about.badgeLine')}</div>
                        <h4 className="about-card-title">{line.title}</h4>
                      </div>
                      <div className="about-card-divider" />
                      <p className="about-card-bases">
                        <strong>{t('about.basedOn')}</strong> {line.bases}
                      </p>
                      <div className="about-card-subareas">
                        <strong>{t('about.priorityAreas')}</strong>
                        <ul className="about-subareas-list">
                          {line.areas.map((area, idx) => (
                            <li key={idx}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sección 3: Grupos de Investigación */}
            {activeSection === 'grupos-investigacion' && (
              <section id="grupos-investigacion" className="about-stacked-section" style={{ paddingBottom: '4rem' }}>
                <p className="about-tab-description">
                  {t('about.researchGroupsDescription')}
                </p>

                <div className="about-tabs-grid-container">
                  {researchGroupsDetail.map((group) => (
                    <div key={group.codigo} className="about-info-card">
                      <div className="about-card-header-row">
                        <div className="about-card-badge group-badge">{group.codigo}</div>
                        <h4 className="about-card-title">{group.nombre}</h4>
                      </div>
                      <div className="about-card-divider" />
                      <p className="about-card-bases">
                        <strong>{t('about.basedOn')}</strong> {group.bases}
                      </p>
                      <div className="about-card-meta-row">
                        <div>
                          <strong>{t('about.associatedLine')}</strong> <span className="meta-value">{group.lineas}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Columna Derecha: Menú Lateral Sticky (Estilo Frontiers) */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">{t('nav.whoWeAre')}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#quienes-somos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('quienes-somos'); }} 
                  className={`sidebar-link ${activeSection === 'quienes-somos' ? 'active' : ''}`}
                >
                  {t('nav.whoWeAre')}
                </a>
              </li>
              <li>
                <a 
                  href="#lineas-investigacion" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('lineas-investigacion'); }} 
                  className={`sidebar-link ${activeSection === 'lineas-investigacion' ? 'active' : ''}`}
                >
                  {t('nav.lineasInvestigacion')}
                </a>
              </li>
              <li>
                <a 
                  href="#grupos-investigacion" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('grupos-investigacion'); }} 
                  className={`sidebar-link ${activeSection === 'grupos-investigacion' ? 'active' : ''}`}
                >
                  {t('nav.grupos')}
                </a>
              </li>
            </ul>
          </aside>

        </div>
      </section>

      {/* Footer Premium BCP Style */}
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
                <li>
                  <a href="https://www.sistemasunas.edu.pe/nuestra-facultad/decanatura" target="_blank" rel="noopener noreferrer">
                    {t('footer.decanato')}
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/departamentos-academicos" target="_blank" rel="noopener noreferrer">
                    {t('footer.departments')}
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/comisiones/comision-grados-y-titulos" target="_blank" rel="noopener noreferrer">
                    {t('footer.commission')}
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/unidad-de-investigacion" target="_blank" rel="noopener noreferrer">
                    {t('footer.researchUnit')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t('footer.universityLabel')}</h4>
              <ul>
                <li>
                  <a href="https://www.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    {t('footer.portalUNAS')}
                  </a>
                </li>
                <li>
                  <a href="https://investigacion.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    {t('footer.vicerrectorado')}
                  </a>
                </li>
                <li>
                  <a href="https://biblioteca.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    {t('footer.library')}
                  </a>
                </li>
                <li>
                  <a href="https://repositorio.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    {t('footer.repository')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t('footer.legal')}</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {t('footer.userManual')}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {t('footer.termsOfUse')}
                  </a>
                </li>
                <li>
                  <a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer">
                    {t('footer.researchRegulations')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-copyright">
          <p>{t('footer.copyrightSGI')}</p>
        </div>
      </footer>
    </div>
  );
};

export default SobreSgiPage;
