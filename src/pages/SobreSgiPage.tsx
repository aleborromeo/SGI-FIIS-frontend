import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';
import frontisImage from '../assets/images/frontis_fiis.png';
import universityIcon from '../assets/images/icons8-universidad-50 (1).png';

export const SobreSgiPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'lines' | 'groups'>('general');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <div className="welcome-brand-texts">
            <h1 className="welcome-brand-title">SGI-FIIS</h1>
            <span className="welcome-brand-subtitle">Sistema de Gestión de Investigación</span>
          </div>
        </div>
        
        {/* Enlaces de Navegación */}
        <nav className="welcome-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="nav-link">Inicio</a>
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              navigate('/', { state: { scrollTo: 'noticias' } }); 
            }} 
            className="nav-link"
          >
            Convocatorias
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="nav-link active">Sobre SGI</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="nav-link">Contacto</a>
        </nav>

        <div className="welcome-navbar-actions">
          <button onClick={() => navigate('/login')} className="btn-nav btn-outline-light-navbar">
            Iniciar sesión
          </button>
        </div>
      </header>

      {/* Sección Sobre SGI (Captura blanca estilo FIIS) */}
      <section className="welcome-about-fiis-section" style={{ marginTop: '70px', minHeight: 'calc(100vh - 120px)' }}>
        <div className="about-fiis-container">
          
          {/* Columna Izquierda: Menú Lateral (Pestañas Interactivas) */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">Sobre el SGI</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('general'); }} 
                  className={`sidebar-link ${activeTab === 'general' ? 'active' : ''}`}
                >
                  Descripción General
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('lines'); }} 
                  className={`sidebar-link ${activeTab === 'lines' ? 'active' : ''}`}
                >
                  Líneas de Investigación
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('groups'); }} 
                  className={`sidebar-link ${activeTab === 'groups' ? 'active' : ''}`}
                >
                  Grupos de Investigación
                </a>
              </li>
            </ul>
          </aside>

          {/* Columna Derecha: Contenido Principal */}
          <div className="about-fiis-main-content">
            
            {/* Breadcrumb Dinámico */}
            <div className="about-fiis-breadcrumbs">
              Inicio » Sobre SGI » {activeTab === 'general' ? 'Descripción General' : activeTab === 'lines' ? 'Líneas de Investigación' : 'Grupos de Investigación'}
            </div>

            {/* Renderizado de Pestaña 1: DESCRIPCIÓN GENERAL */}
            {activeTab === 'general' && (
              <>
                <h2 className="about-fiis-title">Sistema de Gestión de Investigación (SGI-FIIS)</h2>

                {/* Fila superior: Tabla de detalles + Imagen */}
                <div className="about-fiis-details-grid">
                  
                  {/* Tabla de detalles */}
                  <div className="about-fiis-info-table">
                    <div className="info-table-row">
                      <span className="info-label">Propósito del SGI:</span>
                      <span className="info-value">Automatizar, controlar y dar seguimiento a los procesos académicos y administrativos de investigación.</span>
                    </div>
                    <div className="info-table-row">
                      <span className="info-label">Facultad:</span>
                      <span className="info-value">Facultad de Ingeniería en Informática y Sistemas (FIIS)</span>
                    </div>
                    <div className="info-table-row">
                      <span className="info-label">Institución:</span>
                      <span className="info-value">Universidad Nacional Agraria de la Selva (UNAS)</span>
                    </div>
                    <div className="info-table-row">
                      <span className="info-label">Reglamento & Normas:</span>
                      <span className="info-value">
                        <a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer" className="info-link">Descargar Normas</a>
                      </span>
                    </div>
                    <div className="info-table-row">
                      <span className="info-label">Manual de Usuario:</span>
                      <span className="info-value">
                        <a href="#" onClick={(e) => e.preventDefault()} className="info-link-disabled">Próximamente</a>
                      </span>
                    </div>
                  </div>

                  {/* Imagen del Edificio de la Escuela */}
                  <div className="about-fiis-image-container">
                    <img src={frontisImage} alt="Facultad FIIS" className="about-fiis-img" />
                    <div className="about-fiis-img-caption">
                      Facultad de Ingeniería en Informática y Sistemas
                    </div>
                  </div>

                </div>

                {/* Fila inferior: Módulos del SGI */}
                <div className="about-fiis-columns-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="about-fiis-column">
                    <h3 className="column-title">Módulos de Gestión:</h3>
                    <p className="column-intro">
                      El SGI-FIIS digitaliza de extremo a extremo las etapas clave del ecosistema de investigación:
                    </p>
                    <ul className="column-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
                      <li><strong>Proyectos de Investigación:</strong> Presentación y seguimiento de planes de docentes.</li>
                      <li><strong>Planes de Tesis:</strong> Trámite de investigación formativa para tesistas.</li>
                      <li><strong>Informes de Avance:</strong> Reportes de progreso periódico y logros de metas.</li>
                      <li><strong>Resoluciones Decanales:</strong> Emisión de resoluciones aprobatorias oficiales.</li>
                      <li><strong>Evaluaciones de Jurado:</strong> Calificación y dictamen sobre los trabajos.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Renderizado de Pestaña 2: LÍNEAS DE INVESTIGACIÓN */}
            {activeTab === 'lines' && (
              <>
                <h2 className="about-fiis-title">Líneas de Investigación de la FIIS</h2>
                <p className="about-tab-description">
                  La Facultad cuenta con líneas aprobadas que orientan la producción científica de docentes y estudiantes hacia la solución de necesidades tecnológicas.
                </p>

                <div className="about-tabs-grid-container">
                  {researchLinesDetail.map((line) => (
                    <div key={line.title} className="about-info-card">
                      <div className="about-card-header-row">
                        <div className="about-card-badge">LÍNEA</div>
                        <h4 className="about-card-title">{line.title}</h4>
                      </div>
                      <div className="about-card-divider" />
                      <p className="about-card-bases">
                        <strong>En qué se basa:</strong> {line.bases}
                      </p>
                      <div className="about-card-subareas">
                        <strong>Áreas prioritarias:</strong>
                        <ul className="about-subareas-list">
                          {line.areas.map((area, idx) => (
                            <li key={idx}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Renderizado de Pestaña 3: GRUPOS DE INVESTIGACIÓN */}
            {activeTab === 'groups' && (
              <>
                <h2 className="about-fiis-title">Grupos de Investigación Registrados</h2>
                <p className="about-tab-description">
                  Las agrupaciones de docentes investigadores, egresados y alumnos que impulsan la generación de conocimiento en informática y sistemas.
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
                        <strong>En qué se basa:</strong> {group.bases}
                      </p>
                      <div className="about-card-meta-row">
                        <div>
                          <strong>Línea científica asociada:</strong> <span className="meta-value">{group.lineas}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      </section>

      {/* Footer Premium BCP Style */}
      <footer className="welcome-footer-premium">
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
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => e.preventDefault()}>
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
