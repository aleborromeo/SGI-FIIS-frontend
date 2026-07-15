import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import './WelcomePage.css';
import frontisImage from '../assets/images/frontis_fiis.png';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import { Globe, User, ChevronDown } from 'lucide-react';
import { callService } from '../services/callService';

// Importar imágenes de las Líneas de Investigación
import computacionImg from '../assets/images/computacion.jpg';
import softwareImg from '../assets/images/software.jpg';
import aiImg from '../assets/images/AI.jpg';
import cienciaDatosImg from '../assets/images/ciencia de datos.png';
import redesImg from '../assets/images/redes.jpg';
import ciberseguridadImg from '../assets/images/ciberseguridad.jpg';
import yapeLogo from '../assets/images/logoyape.png';
import sedeUnasImage from '../assets/images/sede-unas.jpg';
import scivalLogo from '../assets/images/scival.jpg';
import scopusLogo from '../assets/images/scopus.png';
import taylorFrancisLogo from '../assets/images/taylorFrancis.jpg';
import scienceDirectLogo from '../assets/images/sciencieDirect.png';
import convocatoriasBg from '../assets/images/convocatorias.png';
import reconocimientoBg from '../assets/images/reconocimineto.png';
import congresosBg from '../assets/images/congresos.png';

export const WelcomePage: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(3);
  const [activeLink, setActiveLink] = useState<'inicio' | 'convocatorias'>('inicio');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [latestCall, setLatestCall] = useState<any>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    callService.getVigent()
      .then((data) => {
        if (data && data.length > 0) {
          setLatestCall(data[0]);
        }
      })
      .catch((err) => console.error('Error fetching vigent calls:', err));
  }, []);


  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleNavClick = (link: 'inicio' | 'convocatorias', targetId?: string) => {
    setActiveLink(link);
    if (targetId) {
      scrollToSection(targetId);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.state) {
      const target = (location.state as any).scrollTo;
      if (target === 'noticias') {
        setActiveLink('convocatorias');
        setTimeout(() => {
          scrollToSection('noticias');
        }, 150);
      } else if (target === 'contacto') {
        setTimeout(() => {
          scrollToSection('contacto');
        }, 150);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);



  const slides = [
    {
      title: language === 'es' ? (
        <>
          Sistema de Gestión <br />
          de Investigación <br />
          <span className="highlight-text-blue">SGI-FIIS</span>
        </>
      ) : (
        <>
          Research Management <br />
          System <br />
          <span className="highlight-text-blue">SGI-FIIS</span>
        </>
      ),
      description: language === 'es' 
        ? "Gestiona, coordina y de seguimiento a tus proyectos e iniciativas académicas de investigación."
        : "Manage, coordinate, and monitor your academic research projects and initiatives.",
      image: frontisImage,
      bgColor: '#ffffff',
      desktopGradient: 'linear-gradient(90deg, #ffffff 0%, #ffffff 20%, rgba(255, 255, 255, 0.75) 38%, rgba(255, 255, 255, 0) 65%)',
      mobileGradient: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 60%, rgba(255, 255, 255, 0.4) 100%)',
    },
    {
      title: language === 'es' ? (
        <>
          Sistema de Gestión <br />
          de Investigación <br />
          <span className="highlight-text-blue">UNAS</span>
        </>
      ) : (
        <>
          Research Management <br />
          System <br />
          <span className="highlight-text-blue">UNAS</span>
        </>
      ),
      description: language === 'es' 
        ? "Impulsando la investigación, la innovación y el desarrollo académico de nuestra universidad."
        : "Boosting research, innovation, and academic development at our university.",
      image: sedeUnasImage,
      bgColor: '#e8f7f5',
      desktopGradient: 'linear-gradient(90deg, #e8f7f5 0%, #e8f7f5 20%, rgba(232, 247, 245, 0.75) 38%, rgba(232, 247, 245, 0) 65%)',
      mobileGradient: 'linear-gradient(180deg, rgba(232, 247, 245, 0.95) 0%, rgba(232, 247, 245, 0.85) 60%, rgba(232, 247, 245, 0.4) 100%)',
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 7000); // Cambia cada 7 segundos
    return () => clearInterval(timer);
  }, []);

  const [stats, setStats] = useState({
    proyectosRegistrados: 320,
    tesis: 145,
    docentesInvestigadores: 25,
    gruposInvestigacion: 7,
    proyectosCulminados: 58
  });

  const [groups, setGroups] = useState([
    { codigo: 'GINSOFT', nombre: 'Grupo de Investigación en Ingeniería de Software', investigaciones: 18, miembros: 3, publicaciones: 18 },
    { codigo: 'RESEGTI', nombre: 'Red de Seguridad y Gestión de TI', investigaciones: 12, miembros: 2, publicaciones: 12 },
    { codigo: 'GISI', nombre: 'Grupo de Investigación en Sistemas de Información', investigaciones: 15, miembros: 2, publicaciones: 15 },
    { codigo: 'CICO', nombre: 'Círculo de Computación', investigaciones: 22, miembros: 4, publicaciones: 22 },
    { codigo: 'EAP', nombre: 'Estadística Aplicada', investigaciones: 8, miembros: 1, publicaciones: 8 },
    { codigo: 'MAP', nombre: 'Matemática Aplicada', investigaciones: 10, miembros: 1, publicaciones: 10 },
    { codigo: 'EU', nombre: 'Emprendimiento Universitario', investigaciones: 6, miembros: 1, publicaciones: 6 }
  ]);

  const researchLines = [
    {
      title: 'Computación',
      image: computacionImg,
      description: 'Fundamentos teóricos, computación científica y algorítmica avanzada.',
      theme: 'dark'
    },
    {
      title: 'Ingeniería de Software',
      image: softwareImg,
      description: 'Metodologías, procesos y patrones para construir software de calidad mundial.',
      theme: 'light'
    },
    {
      title: 'Inteligencia Artificial',
      image: aiImg,
      description: 'Redes neuronales, procesamiento de lenguaje natural y visión artificial.',
      theme: 'light'
    },
    {
      title: 'Ciencia de Datos',
      image: cienciaDatosImg,
      description: 'Minería de datos masiva, analítica predictiva e inteligencia de negocios.',
      theme: 'dark'
    },
    {
      title: 'Redes y Telecomunicaciones',
      image: redesImg,
      description: 'Arquitectura de redes, computación en la nube y protocolos de conectividad.',
      theme: 'dark'
    },
    {
      title: 'Ciberseguridad',
      image: ciberseguridadImg,
      description: 'Auditoría informática, hacking ético, protección de datos e infraestructura crítica.',
      theme: 'light'
    }
  ];

  useEffect(() => {
    api.get<any>('/auth/public-stats')
      .then((data) => {
        if (data) {
          setStats({
            proyectosRegistrados: data.proyectosRegistrados ?? 320,
            tesis: data.tesis ?? 145,
            docentesInvestigadores: data.docentesInvestigadores ?? 25,
            gruposInvestigacion: data.gruposInvestigacion ?? 7,
            proyectosCulminados: data.proyectosCulminados ?? 58
          });
        }
      })
      .catch((err) => {
        console.warn('Error loading public stats, using mock values', err);
      });

    api.get<any[]>('/auth/public-groups')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedGroups = data.map(g => ({
            ...g,
            investigaciones: g.publicaciones ?? 0
          }));
          setGroups(mappedGroups);
        }
      })
      .catch((err) => {
        console.warn('Error loading public groups, using mock values', err);
      });
  }, []);

  // Calcular el máximo de investigaciones para escalar las estrellas
  const maxInvestigaciones = groups.length > 0 ? Math.max(...groups.map(g => g.investigaciones ?? 0)) : 1;

  // Componente inline de estrellas de satisfacción/progreso
  const StarRating = ({ value, max, isActive }: { value: number; max: number; isActive: boolean }) => {
    const totalStars = 5;
    const fillRatio = max > 0 ? value / max : 0;
    const filledStars = fillRatio * totalStars; // e.g. 3.5 stars filled

    return (
      <div className="group-star-rating">
        {Array.from({ length: totalStars }, (_, i) => {
          const starIndex = i + 1;
          let fillPercent = 0;
          if (filledStars >= starIndex) {
            fillPercent = 100; // fully filled
          } else if (filledStars > starIndex - 1) {
            fillPercent = (filledStars - (starIndex - 1)) * 100; // partially filled
          }
          const uniqueId = `star-grad-${value}-${i}`;
          return (
            <svg key={i} className="group-star-icon" viewBox="0 0 24 24" width="18" height="18">
              <defs>
                <linearGradient id={uniqueId}>
                  <stop offset={`${fillPercent}%`} stopColor="#f5a623" />
                  <stop offset={`${fillPercent}%`} stopColor={isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0'} />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#${uniqueId})`}
                stroke={isActive ? 'rgba(255,255,255,0.5)' : '#cbd5e1'}
                strokeWidth="0.8"
              />
            </svg>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleWheelRaw = (e: WheelEvent) => {
      // Solo intercepta el scroll si el cursor está sobre una tarjeta de grupo
      const targetElement = e.target as HTMLElement;
      if (!targetElement.closest('.group-carousel-card')) {
        return; // Deja que la página haga scroll normal
      }

      e.preventDefault();
      if (e.deltaY > 0) {
        setActiveIndex((prev) => (prev + 1) % groups.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + groups.length) % groups.length);
      }
    };

    el.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelRaw);
    };
  }, [groups.length]);

  return (
    <div className="welcome-page-container">
      {/* Barra de navegación superior en Azul Normal */}
      <header className="welcome-navbar">
        <div className="welcome-brand">
          <img src={universityIcon} alt="SGI Logo" className="welcome-logo-img-mini" />
        </div>

        {/* Enlaces de Navegación del Mockup */}
        <nav className="welcome-nav-links">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavClick('inicio'); }}
            className={`nav-link ${activeLink === 'inicio' ? 'active' : ''}`}
          >
            {language === 'es' ? 'Inicio' : 'Home'}
          </a>

          {/* Dropdown: Novedades */}
          <div className="nav-dropdown">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/novedades'); }}
              className={`nav-link dropdown-toggle ${activeLink === 'convocatorias' ? 'active' : ''}`}
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

      {/* Sección Hero con Imagen Degradada y Fondos Cambiantes */}
      <main
        className="welcome-hero-section"
        style={{
          background: slides[currentSlideIndex].bgColor,
          transition: 'background 1.2s ease-in-out',
          '--desktop-gradient': slides[currentSlideIndex].desktopGradient,
          '--mobile-gradient': slides[currentSlideIndex].mobileGradient
        } as React.CSSProperties}
      >
        {/* Contenedor de Imagen de Fondo Full Screen */}
        <div className="welcome-hero-bg-container">
          {slides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt="SGI - UNAS"
              className="welcome-hero-bg-image"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: idx === currentSlideIndex ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
                zIndex: idx === currentSlideIndex ? 2 : 1
              }}
            />
          ))}
          {/* Capa de Degradado Overlay */}
          <div className="welcome-hero-gradient-overlay" />
        </div>

        <div className="welcome-hero-content">
          {/* Columna Izquierda: Textos Animados y Botones (El key fuerza a React a ejecutar la animación al cambiar de slide) */}
          <div key={currentSlideIndex} className="welcome-hero-left slide-enter-active">
            <h2 className="welcome-hero-title">
              {slides[currentSlideIndex].title}
            </h2>
            <div className="title-divider" />
            <p className="welcome-hero-desc">
              {slides[currentSlideIndex].description}
            </p>

            <div className="welcome-hero-actions">
              <button onClick={() => navigate('/login')} className="btn-hero btn-hero-primary-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                </svg>
                <span>{language === 'es' ? 'Iniciar sesión' : 'Log In'}</span>
              </button>
            </div>

            {/* Pequeña sección de estadísticas clara y entendible debajo de los botones */}
            <div className="hero-mini-stats-container">
              <div className="hero-mini-stats-divider" />
              <div className="hero-mini-stats-grid">
                <div className="hero-mini-stat-item">
                  <div className="hero-mini-stat-row">
                    <svg className="hero-mini-stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="hero-mini-stat-number">{stats.proyectosRegistrados}</span>
                  </div>
                  <span className="hero-mini-stat-label">
                    {language === 'es' ? 'Proyectos Activos' : 'Active Projects'}
                  </span>
                </div>

                <div className="hero-mini-stat-item">
                  <div className="hero-mini-stat-row">
                    <svg className="hero-mini-stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hero-mini-stat-number">{stats.docentesInvestigadores}</span>
                  </div>
                  <span className="hero-mini-stat-label">
                    {language === 'es' ? 'Investigadores' : 'Researchers'}
                  </span>
                </div>

                <div className="hero-mini-stat-item">
                  <div className="hero-mini-stat-row">
                    <svg className="hero-mini-stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.367 1.243.583 1.83l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.12c-.783-.587-.377-1.83.582-1.83h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                    <span className="hero-mini-stat-number">{stats.proyectosCulminados}</span>
                  </div>
                  <span className="hero-mini-stat-label">
                    {language === 'es' ? 'Publicaciones' : 'Publications'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Ahora es un espaciador en desktop para mantener la estructura de rejilla y empujar el texto a la izquierda */}
          <div className="welcome-hero-right-spacer" />
        </div>

        {/* Fila de repositorios flotante en la esquina inferior derecha */}
        <div className="hero-repos-container">
          <div className="hero-repos-rect-card">
            <div className="hero-repos-list">
              <a href="https://www.scopus.com" target="_blank" rel="noopener noreferrer" className="hero-repo-item-link logo-scopus" title="Scopus">
                <img src={scopusLogo} alt="Scopus" className="hero-repo-logo-img" />
              </a>
              <a href="https://www.sciencedirect.com" target="_blank" rel="noopener noreferrer" className="hero-repo-item-link logo-sciencedirect" title="ScienceDirect">
                <img src={scienceDirectLogo} alt="ScienceDirect" className="hero-repo-logo-img" />
              </a>
              <a href="https://www.scival.com" target="_blank" rel="noopener noreferrer" className="hero-repo-item-link logo-scival" title="SciVal">
                <img src={scivalLogo} alt="SciVal" className="hero-repo-logo-img" />
              </a>
              <a href="https://www.tandfonline.com" target="_blank" rel="noopener noreferrer" className="hero-repo-item-link logo-taylorfrancis" title="Taylor & Francis">
                <img src={taylorFrancisLogo} alt="Taylor & Francis" className="hero-repo-logo-img" />
              </a>

              {/* Flecha a MYLOFT */}
              <a href="https://unas.myloft.xyz" target="_blank" rel="noopener noreferrer" className="hero-repo-more-arrow-only logo-arrow" title="Ver más en MyLoft">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1a365d" strokeWidth="3" className="myloft-arrow-icon-only">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Sección de Líneas de Investigación */}
      <section id="lineas" className="welcome-lines-section">
        <div className="lines-header-container">
          <span className="lines-category-label">INVESTIGACIÓN CIENTÍFICA</span>
          <h3 className="lines-main-title">Explora nuestras líneas de investigación</h3>
          <p className="lines-main-subtitle">
            Conoce los campos científicos en los que desarrollamos proyectos de alto impacto y excelencia
          </p>
        </div>

        <div className="lines-grid">
          {researchLines.map((line) => (
            <div key={line.title} className={`line-card theme-${line.theme}`}>
              <img src={line.image} alt={line.title} className="line-card-img" />
              <div className="line-card-overlay" />
              <div className="line-card-content">
                <h4 className="line-card-title">{line.title}</h4>
                <p className="line-card-desc">{line.description}</p>
                <div className="line-card-link">
                  <span>Explorar línea</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Grupos de Investigación */}
      <section id="grupos" className="welcome-groups-section">
        <div className="lines-header-container">
          <span className="lines-category-label">AGRUPACIONES CIENTÍFICAS</span>
          <h3 className="lines-main-title">Grupos de Investigación</h3>
          <p className="lines-main-subtitle">
            Conoce las agrupaciones científicas que impulsan la innovación y desarrollo en la FIIS
          </p>
        </div>

        <div className="groups-carousel-wrapper">
          {/* Contenedor del Carrusel 3D */}
          <div className="groups-carousel-container" ref={carouselRef}>
            <div className="groups-carousel-track">
              {groups.map((group, index) => {
                let diff = index - activeIndex;
                const total = groups.length;

                // Wrap around for circular loop
                if (diff > total / 2) diff -= total;
                if (diff < -total / 2) diff += total;

                const absDiff = Math.abs(diff);
                const isActive = absDiff === 0;

                // Calculate 3D transforms
                const translateX = diff * 150;
                const scale = isActive ? 1.15 : 1 - absDiff * 0.12;
                const zIndex = 10 - absDiff;
                const opacity = isActive ? 1 : Math.max(0.35, 0.85 - absDiff * 0.20);

                return (
                  <div
                    key={group.codigo}
                    className={`group-carousel-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      cursor: 'pointer',
                    }}
                  >
                    <div className="group-card-badge">{group.codigo}</div>
                    <div className="group-card-name">{group.nombre}</div>

                    <div className="group-card-stats">
                      <div className="group-stat-item" title="Investigadores / Miembros">
                        <svg className="group-stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="group-stat-number">{group.miembros ?? 0}</span>
                      </div>
                      <div className="group-stat-item" title="Publicaciones / Proyectos">
                        <svg className="group-stat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="group-stat-number">{group.publicaciones ?? 0}</span>
                      </div>
                    </div>

                    <StarRating value={group.investigaciones} max={maxInvestigaciones} isActive={isActive} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controles de navegación debajo de la tarjeta */}
        <div className="carousel-controls-bottom">
          <button
            className="carousel-control-btn-bottom"
            onClick={() => setActiveIndex((prev) => (prev - 1 + groups.length) % groups.length)}
            title="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="carousel-control-btn-bottom"
            onClick={() => setActiveIndex((prev) => (prev + 1) % groups.length)}
            title="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Botón para ver todos */}
        <div className="groups-action-container">
          <button
            onClick={() => navigate('/login')}
            className="btn-all-groups"
          >
            <span>Ver todos los grupos de investigación</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>



      {/* Sección de Noticias */}
      <section id="noticias" className="welcome-news-section">
        <div className="lines-header-container">
          <span className="lines-category-label">NOTICIAS Y EVENTOS</span>
          <h3 className="lines-main-title">Novedades de Investigación</h3>
          <p className="lines-main-subtitle">
            Mantente informado con los últimos acontecimientos y oportunidades del ecosistema científico.
          </p>
        </div>

        <div className="news-grid">
          <div
            className="news-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), url(${convocatoriasBg})`
            }}
          >
            <div className="news-card-badge">CONVOCATORIA</div>
            <div className="news-card-content">
              <h4>{latestCall ? latestCall.title : (language === 'es' ? 'Nuevas convocatorias' : 'New announcements')}</h4>
              <p className="news-card-desc">
                {latestCall 
                  ? (latestCall.description.length > 120 ? latestCall.description.substring(0, 120) + '...' : latestCall.description)
                  : (language === 'es' 
                      ? 'Se abren las postulaciones para el financiamiento de proyectos de investigación científica aplicada y desarrollo tecnológico.'
                      : 'Applications are now open for the funding of scientific research and technological development projects.')}
              </p>
              <div className="news-card-bottom-row">
                <span className="news-card-date">
                  {latestCall 
                    ? `${language === 'es' ? 'Cierre:' : 'Deadline:'} ${latestCall.endDate}` 
                    : '02 de Julio, 2026'}
                </span>
                <button onClick={() => navigate('/novedades', { state: { scrollToHash: 'novedades-convocatorias' } })} className="news-card-action-btn">
                  <span>{language === 'es' ? 'Ver' : 'View'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div
            className="news-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), url(${reconocimientoBg})`
            }}
          >
            <div className="news-card-badge">RECONOCIMIENTO</div>
            <div className="news-card-content">
              <h4>Docentes premiados</h4>
              <p className="news-card-desc">Felicitamos a nuestros docentes investigadores reconocidos a nivel nacional por sus patentes e impacto científico en informática.</p>
              <div className="news-card-bottom-row">
                <span className="news-card-date">28 de Junio, 2026</span>
                <button onClick={() => navigate('/novedades', { state: { scrollToHash: 'novedades-reconocimientos' } })} className="news-card-action-btn">
                  <span>Ver</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div
            className="news-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.88) 100%), url(${congresosBg})`
            }}
          >
            <div className="news-card-badge">CONGRESOS</div>
            <div className="news-card-content">
              <h4>Próximos congresos</h4>
              <p className="news-card-desc">Inscríbete en los talleres, ponencias y mesas redondas programadas para el evento académico más grande del año en la UNAS.</p>
              <div className="news-card-bottom-row">
                <span className="news-card-date">15 de Junio, 2026</span>
                <button onClick={() => navigate('/novedades', { state: { scrollToHash: 'novedades-congresos' } })} className="news-card-action-btn">
                  <span>Ver</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Premium BCP Style */}
      <footer id="footer" className="welcome-footer-premium">
        {/* Botón para subir (tipo chevron en el medio de la línea ploma) */}
        <div className="footer-scroll-top-container">
          <div className="footer-scroll-top-line" />
          <button
            className="footer-scroll-top-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Volver arriba"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <div className="footer-premium-content">
          <div className="footer-columns-wrapper">
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
              <h4>Contacto</h4>
              <ul>
                <li>
                  <a href="https://www.sistemasunas.edu.pe/contact" target="_blank" rel="noopener noreferrer">
                    Soporte Técnico
                  </a>
                </li>
                <li>
                  <a href="https://mesadepartes.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Mesa de Partes Virtual UNAS
                  </a>
                </li>
                <li>
                  <a href="https://maps.google.com/?q=Universidad+Nacional+Agraria+de+la+Selva" target="_blank" rel="noopener noreferrer">
                    Ubicación
                  </a>
                </li>
                <li>
                  <a href="https://www.unas.edu.pe" target="_blank" rel="noopener noreferrer">
                    Directorio Telefónico
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Normativas</h4>
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

          {/* Columna derecha con Yape QR */}
          <div className="footer-yape-column">
            <h4>Dona a SGI</h4>
            <p>Escanea el código QR con tu celular Yape para colaborar con el mantenimiento de la plataforma</p>
            <div className="yape-qr-box">
              <div className="yape-qr-wrapper">
                <svg className="yape-qr-svg" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="25" height="25" fill="#1a365d" />
                  <rect x="5" y="5" width="15" height="15" fill="#ffffff" />
                  <rect x="8" y="8" width="9" height="9" fill="#1a365d" />

                  <rect x="75" y="0" width="25" height="25" fill="#1a365d" />
                  <rect x="80" y="5" width="15" height="15" fill="#ffffff" />
                  <rect x="83" y="8" width="9" height="9" fill="#1a365d" />

                  <rect x="0" y="75" width="25" height="25" fill="#1a365d" />
                  <rect x="5" y="80" width="15" height="15" fill="#ffffff" />
                  <rect x="8" y="83" width="9" height="9" fill="#1a365d" />

                  <rect x="35" y="10" width="5" height="15" fill="#1a365d" />
                  <rect x="45" y="5" width="10" height="5" fill="#1a365d" />
                  <rect x="60" y="15" width="5" height="20" fill="#1a365d" />
                  <rect x="10" y="35" width="15" height="5" fill="#1a365d" />
                  <rect x="5" y="45" width="5" height="15" fill="#1a365d" />
                  <rect x="20" y="55" width="10" height="5" fill="#1a365d" />

                  <rect x="75" y="35" width="10" height="10" fill="#1a365d" />
                  <rect x="90" y="45" width="5" height="15" fill="#1a365d" />
                  <rect x="80" y="65" width="15" height="5" fill="#1a365d" />

                  <rect x="35" y="75" width="5" height="15" fill="#1a365d" />
                  <rect x="45" y="85" width="15" height="5" fill="#1a365d" />
                  <rect x="65" y="75" width="5" height="10" fill="#1a365d" />

                  <rect x="35" y="35" width="30" height="30" rx="4" fill="#ffffff" stroke="#1a365d" strokeWidth="2" />
                </svg>
                <img src={yapeLogo} alt="Yape Logo" className="yape-center-logo" />
              </div>
            </div>
            <div className="yape-badge-tag">
              <span>¡DONA A SGI!</span>
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

export default WelcomePage;
