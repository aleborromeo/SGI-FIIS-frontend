import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WelcomePage.css';
import frontisImage from '../assets/images/frontis_fiis.png';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import whatsappGif from '../assets/images/icons8-whatsapp.gif';
import { Globe, User, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [activeSection, setActiveSection] = useState('contacto-form-section');

  const [contactForm, setContactForm] = useState({
    userEmail: '',
    deptEmail: 'sgi.decanato@unas.edu.pe',
    msgType: 'comentario',
    message: ''
  });

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      language === 'es' 
        ? '¡Mensaje enviado con éxito al departamento!' 
        : 'Message sent successfully to the department!'
    );
    setContactForm({
      userEmail: '',
      deptEmail: 'sgi.decanato@unas.edu.pe',
      msgType: 'comentario',
      message: ''
    });
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
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{language === 'es' ? 'Contacto' : 'Contact'}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('contacto-form-section'); }}
                className="dropdown-item"
              >
                {language === 'es' ? 'Correo' : 'Email'}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('whatsapp-contact-section'); }}
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
          
          {/* Columna Izquierda: Formulario y Detalles */}
          <div className="about-fiis-main-content">
            <div className="about-fiis-breadcrumbs">
              {language === 'es' ? 'Inicio » Contacto » Correo y Sugerencias' : 'Home » Contact » Email & Suggestions'}
            </div>

            {/* Sección: Formulario */}
            {activeSection === 'contacto-form-section' && (
              <section id="contacto-form-section" className="about-stacked-section">
                <h2 className="about-fiis-title" style={{ marginBottom: '1rem' }}>
                  {language === 'es' ? 'Enviar un Correo o Sugerencia' : 'Send an Email or Suggestion'}
                </h2>
                <p className="about-tab-description">
                  {language === 'es'
                    ? 'Utiliza nuestro formulario oficial para remitir quejas, comentarios o sugerencias directamente a la Unidad o Decanato de la facultad.'
                    : 'Use our official form to submit complaints, comments or suggestions directly to the Unit or Deanery of the faculty.'}
                </p>

                {/* Formulario de contacto */}
                <div className="contact-form-card" style={{ marginTop: '1rem' }}>
                  <form onSubmit={handleContactSubmit} className="contact-form">
                    <div className="form-group-row">
                      <div className="form-input-group">
                        <label htmlFor="userEmail">{language === 'es' ? 'Tu Correo Electrónico' : 'Your Email'}</label>
                        <input 
                          type="email" 
                          id="userEmail" 
                          required 
                          placeholder="ejemplo@unas.edu.pe"
                          value={contactForm.userEmail}
                          onChange={(e) => setContactForm({ ...contactForm, userEmail: e.target.value })}
                        />
                      </div>

                      <div className="form-input-group">
                        <label htmlFor="deptEmail">{language === 'es' ? 'Enviar al Departamento' : 'Send to Department'}</label>
                        <select 
                          id="deptEmail"
                          value={contactForm.deptEmail}
                          onChange={(e) => setContactForm({ ...contactForm, deptEmail: e.target.value })}
                        >
                          <option value="sgi.decanato@unas.edu.pe">{language === 'es' ? 'Decanato FIIS (decanato@unas.edu.pe)' : 'FIIS Deanery (decanato@unas.edu.pe)'}</option>
                          <option value="sgi.investigacion@unas.edu.pe">{language === 'es' ? 'Unidad de Investigación (investigacion@unas.edu.pe)' : 'Research Unit (investigacion@unas.edu.pe)'}</option>
                          <option value="sgi.soporte@unas.edu.pe">{language === 'es' ? 'Soporte Técnico SGI (soporte@unas.edu.pe)' : 'SGI Tech Support (soporte@unas.edu.pe)'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-input-group">
                      <label htmlFor="msgType">{language === 'es' ? 'Tipo de Mensaje' : 'Message Type'}</label>
                      <select 
                        id="msgType"
                        value={contactForm.msgType}
                        onChange={(e) => setContactForm({ ...contactForm, msgType: e.target.value })}
                      >
                        <option value="queja">{language === 'es' ? 'Queja' : 'Complaint'}</option>
                        <option value="comentario">{language === 'es' ? 'Comentario' : 'Comment'}</option>
                        <option value="consulta">{language === 'es' ? 'Consulta' : 'Inquiry'}</option>
                      </select>
                    </div>

                    <div className="form-input-group">
                      <label htmlFor="message">{language === 'es' ? 'Mensaje o Sugerencia' : 'Message or Suggestion'}</label>
                      <textarea 
                        id="message" 
                        rows={5} 
                        required 
                        placeholder={language === 'es' ? 'Detalla aquí tu queja o comentario con el mayor detalle posible...' : 'Detail your complaint or comment here with as much detail as possible...'}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-submit-contact">
                      {language === 'es' ? 'Enviar Mensaje' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* Sección: WhatsApp */}
            {activeSection === 'whatsapp-contact-section' && (
              <section id="whatsapp-contact-section" className="about-stacked-section" style={{ paddingBottom: '4rem' }}>
                <h2 className="about-fiis-title" style={{ marginBottom: '1rem' }}>
                  {language === 'es' ? 'Contacto Directo por WhatsApp' : 'Direct Contact via WhatsApp'}
                </h2>
                <p className="about-tab-description">
                  {language === 'es' 
                    ? 'Si prefieres una respuesta más ágil, puedes abrir una ventana de conversación directa con nosotros en cualquier momento.'
                    : 'If you prefer a faster response, you can open a direct conversation window with us at any time.'}
                </p>

                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href="https://wa.me/51900000000" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-whatsapp-direct"
                  >
                    <img src={whatsappGif} alt="WhatsApp" className="whatsapp-contact-icon" />
                    <span>{language === 'es' ? 'Abrir chat de WhatsApp' : 'Open WhatsApp chat'}</span>
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Sidebar Indices Sticky */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">{language === 'es' ? 'Contacto' : 'Contact'}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#contacto-form-section" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('contacto-form-section'); }} 
                  className={`sidebar-link ${activeSection === 'contacto-form-section' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'Correo' : 'Email'}
                </a>
              </li>
              <li>
                <a 
                  href="#whatsapp-contact-section" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('whatsapp-contact-section'); }} 
                  className={`sidebar-link ${activeSection === 'whatsapp-contact-section' ? 'active' : ''}`}
                >
                  {language === 'es' ? 'WhatsApp Directo' : 'Direct WhatsApp'}
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
