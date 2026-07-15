import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WelcomePage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import { Globe, User, ChevronDown } from 'lucide-react';

export const SobreSgiPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [activeSection, setActiveSection] = useState('quienes-somos');

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
            {language === 'es' ? 'Inicio' : 'Home'}
          </a>

          {/* Dropdown: Novedades */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/novedades'); }}
              className="nav-link dropdown-toggle"
            >
              <span>{language === 'es' ? 'Novedades' : 'News'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-convocatorias' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Convocatorias' : 'Announcements'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-reconocimientos' } }); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Reconocimiento' : 'Recognition'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/novedades', { state: { scrollToHash: 'novedades-congresos' } }); }}
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
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{language === 'es' ? 'Sobre nosotros' : 'About us'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('quienes-somos'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Quiénes somos' : 'Who we are'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('lineas-investigacion'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Líneas de investigación' : 'Research lines'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('grupos-investigacion'); }}
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

      {/* Sección Sobre nosotros (Estilo Frontiers) */}
      <section className="welcome-about-fiis-section" style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Cabecera Principal */}
        <div className="about-fiis-header-wrapper">
          <div className="about-fiis-breadcrumbs">
            {language === 'es' 
              ? 'Inicio » Sobre nosotros » Quiénes somos / Líneas / Grupos' 
              : 'Home » About us » Who we are / Lines / Groups'}
          </div>
          <h1 className="about-fiis-main-page-title">
            {activeSection === 'quienes-somos' && (language === 'es' ? 'Quiénes somos' : 'Who we are')}
            {activeSection === 'lineas-investigacion' && (language === 'es' ? 'Líneas de Investigación' : 'Research Lines')}
            {activeSection === 'grupos-investigacion' && (language === 'es' ? 'Grupos de Investigación' : 'Research Groups')}
          </h1>
        </div>

        <div className="about-fiis-container">
          
          {/* Columna Izquierda: Contenido Principal Stacked */}
          <div className="about-fiis-main-content">

            {/* Sección 1: Quiénes somos */}
            {activeSection === 'quienes-somos' && (
              <section id="quienes-somos" className="about-stacked-section">
                
                <h3 className="sgi-article-section-title">
                  {language === 'es' ? 'Donde todo comenzó' : 'Where it all began'}
                </h3>
                
                <article className="sgi-article">
                  <div className="sgi-article-body">
                    <p>
                      {language === 'es' ? (
                        <>El <strong className="text-highlight">SGI-FIIS</strong> fue creado en 2025 por la <strong className="text-highlight">Facultad de Ingeniería en Informática y Sistemas</strong> (<strong className="text-highlight">FIIS</strong>) de la <strong className="text-highlight">Universidad Nacional Agraria de la Selva</strong> (<strong className="text-highlight">UNAS</strong>), con el propósito de centralizar y optimizar la gestión de la investigación científica en nuestra comunidad académica.</>
                      ) : (
                        <>The <strong className="text-highlight">SGI-FIIS</strong> was created in 2025 by the <strong className="text-highlight">Faculty of Computer Science and Systems Engineering</strong> (<strong className="text-highlight">FIIS</strong>) of the <strong className="text-highlight">National Agricultural University of the Jungle</strong> (<strong className="text-highlight">UNAS</strong>), with the purpose of centralizing and optimizing scientific research management in our academic community.</>
                      )}
                    </p>

                    <p>
                      {language === 'es' ? (
                        <>La <strong className="text-highlight">FIIS</strong> y la <strong className="text-highlight">UNAS</strong> impulsaron este proyecto con la visión de lograr una gestión transparente, eficiente y trazable, aprovechando el poder de la tecnología para satisfacer verdaderamente las necesidades de los investigadores, docentes y estudiantes de nuestra facultad.</>
                      ) : (
                        <>The <strong className="text-highlight">FIIS</strong> and <strong className="text-highlight">UNAS</strong> promoted this project with the vision of achieving transparent, efficient and traceable management, leveraging the power of technology to truly meet the needs of researchers, professors and students of our faculty.</>
                      )}
                    </p>

                    <p>
                      {language === 'es' ? (
                        <>Inicialmente orientado a la gestión de planes de tesis y proyectos de investigación docente, el <strong className="text-highlight">SGI-FIIS</strong> abarca ahora la administración integral de resoluciones decanales, evaluaciones de jurado, informes de avance y la trazabilidad completa de cada proceso investigativo. Es una de las plataformas de gestión de investigación más completas y especializadas de la universidad.</>
                      ) : (
                        <>Initially focused on managing thesis plans and faculty research projects, <strong className="text-highlight">SGI-FIIS</strong> now encompasses the comprehensive management of dean resolutions, jury evaluations, progress reports and the complete traceability of every research process. It is one of the most complete and specialized research management platforms at the university.</>
                      )}
                    </p>
                  </div>
                </article>
              </section>
            )}

            {/* Sección 2: Líneas de Investigación */}
            {activeSection === 'lineas-investigacion' && (
              <section id="lineas-investigacion" className="about-stacked-section">
                <p className="about-tab-description">
                  {language === 'es' 
                    ? 'La Facultad cuenta con líneas aprobadas que orientan la producción científica de docentes y estudiantes hacia la solución de necesidades tecnológicas.'
                    : 'The Faculty has approved lines that orient the scientific production of professors and students towards solving technological needs.'}
                </p>

                <div className="about-tabs-grid-container">
                  {researchLinesDetail.map((line) => (
                    <div key={line.title} className="about-info-card">
                      <div className="about-card-header-row">
                        <div className="about-card-badge">{language === 'es' ? 'LÍNEA' : 'LINE'}</div>
                        <h4 className="about-card-title">{line.title}</h4>
                      </div>
                      <div className="about-card-divider" />
                      <p className="about-card-bases">
                        <strong>{language === 'es' ? 'En qué se basa:' : 'Based on:'}</strong> {line.bases}
                      </p>
                      <div className="about-card-subareas">
                        <strong>{language === 'es' ? 'Áreas prioritarias:' : 'Priority areas:'}</strong>
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
                  {language === 'es' 
                    ? 'Las agrupaciones de docentes investigadores, egresados y alumnos que impulsan la generación de conocimiento en informática y sistemas.'
                    : 'Groupings of researcher professors, alumni, and students driving knowledge generation in computing and systems.'}
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
                        <strong>{language === 'es' ? 'En qué se basa:' : 'Based on:'}</strong> {group.bases}
                      </p>
                      <div className="about-card-meta-row">
                        <div>
                          <strong>{language === 'es' ? 'Línea científica asociada:' : 'Associated scientific line:'}</strong> <span className="meta-value">{group.lineas}</span>
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
            <h4 className="sidebar-title">{language === 'es' ? 'Quiénes somos' : 'Who we are'}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#quienes-somos" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('quienes-somos'); }} 
                  className={`sidebar-link ${activeSection === 'quienes-somos' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Quiénes somos' : 'Who we are'}
                </a>
              </li>
              <li>
                <a 
                  href="#lineas-investigacion" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('lineas-investigacion'); }} 
                  className={`sidebar-link ${activeSection === 'lineas-investigacion' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Líneas de investigación' : 'Research lines'}
                </a>
              </li>
              <li>
                <a 
                  href="#grupos-investigacion" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('grupos-investigacion'); }} 
                  className={`sidebar-link ${activeSection === 'grupos-investigacion' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Grupos de investigación' : 'Research groups'}
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
                <li>
                  <a href="https://www.sistemasunas.edu.pe/nuestra-facultad/decanatura" target="_blank" rel="noopener noreferrer">
                    Decanato FIIS
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/departamentos-academicos" target="_blank" rel="noopener noreferrer">
                    Departamentos Académicos
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/comisiones/comision-grados-y-titulos" target="_blank" rel="noopener noreferrer">
                    Comisión de Grados y Títulos
                  </a>
                </li>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/unidad-de-investigacion" target="_blank" rel="noopener noreferrer">
                    Unidad de Investigación FIIS
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Universidad</h4>
              <ul>
                <li>
                  <a href="https://www.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Portal Principal UNAS
                  </a>
                </li>
                <li>
                  <a href="https://investigacion.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Vicerrectorado de Investigación
                  </a>
                </li>
                <li>
                  <a href="https://biblioteca.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Biblioteca Central
                  </a>
                </li>
                <li>
                  <a href="https://repositorio.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Repositorio Institucional
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legales</h4>
              <ul>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Manual de Usuario
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Términos de Uso
                  </a>
                </li>
                <li>
                  <a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer">
                    Reglamento de Investigación
                  </a>
                </li>
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

export default SobreSgiPage;
