import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import './WelcomePage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';
import whatsappGif from '../assets/images/icons8-whatsapp.gif';
import { User, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { t } = useTranslation('public');
  useLanguage();
  const [activeSection, setActiveSection] = useState('contacto-form-section');

  const [contactForm, setContactForm] = useState({
    userEmail: '',
    deptEmail: 'sgi.decanato@unas.edu.pe',
    msgType: 'comentario',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('contact.page.successMessage'));
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
                {t('nav.whoWeAre')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'lineas-investigacion' } }); }}
                className="dropdown-item"
              >
                {t('nav.researchLines')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/sobre-sgi', { state: { scrollToHash: 'grupos-investigacion' } }); }}
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
              onClick={(e) => e.preventDefault()}
              className="nav-link dropdown-toggle active"
            >
              <span>{t('nav.contacto')}</span>
              <ChevronDown size={14} className="dropdown-caret" />
            </a>
            <div className="dropdown-menu">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('contacto-form-section'); }}
                className="dropdown-item"
              >
                {t('nav.email')}
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleScrollToSection('whatsapp-contact-section'); }}
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
          
          {/* Columna Izquierda: Formulario y Detalles */}
          <div className="about-fiis-main-content">
            <div className="about-fiis-breadcrumbs">
              {t('contact.page.breadcrumbs')}
            </div>

            {/* Sección: Formulario */}
            {activeSection === 'contacto-form-section' && (
              <section id="contacto-form-section" className="about-stacked-section">
                <h2 className="about-fiis-title" style={{ marginBottom: '1rem' }}>
                  {t('contact.page.formTitle')}
                </h2>
                <p className="about-tab-description">
                  {t('contact.page.formDescription')}
                </p>

                {/* Formulario de contacto */}
                <div className="contact-form-card" style={{ marginTop: '1rem' }}>
                  <form onSubmit={handleContactSubmit} className="contact-form">
                    <div className="form-group-row">
                      <div className="form-input-group">
                        <label htmlFor="userEmail">{t('contact.page.userEmail')}</label>
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
                        <label htmlFor="deptEmail">{t('contact.page.sendToDepartment')}</label>
                        <select 
                          id="deptEmail"
                          value={contactForm.deptEmail}
                          onChange={(e) => setContactForm({ ...contactForm, deptEmail: e.target.value })}
                        >
                          <option value="sgi.decanato@unas.edu.pe">{t('contact.page.deptDecanato')}</option>
                          <option value="sgi.investigacion@unas.edu.pe">{t('contact.page.deptInvestigacion')}</option>
                          <option value="sgi.soporte@unas.edu.pe">{t('contact.page.deptSoporte')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-input-group">
                      <label htmlFor="msgType">{t('contact.page.messageType')}</label>
                      <select 
                        id="msgType"
                        value={contactForm.msgType}
                        onChange={(e) => setContactForm({ ...contactForm, msgType: e.target.value })}
                      >
                        <option value="queja">{t('contact.page.complaint')}</option>
                        <option value="comentario">{t('contact.page.comment')}</option>
                        <option value="consulta">{t('contact.page.inquiry')}</option>
                      </select>
                    </div>

                    <div className="form-input-group">
                      <label htmlFor="message">{t('contact.page.messageLabel')}</label>
                      <textarea 
                        id="message" 
                        rows={5} 
                        required 
                        placeholder={t('contact.page.messagePlaceholder')}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-submit-contact">
                      {t('contact.page.sendButton')}
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* Sección: WhatsApp */}
            {activeSection === 'whatsapp-contact-section' && (
              <section id="whatsapp-contact-section" className="about-stacked-section" style={{ paddingBottom: '4rem' }}>
                <h2 className="about-fiis-title" style={{ marginBottom: '1rem' }}>
                  {t('contact.page.whatsappTitle')}
                </h2>
                <p className="about-tab-description">
                  {t('contact.page.whatsappDescription')}
                </p>

                <div style={{ marginTop: '1.5rem' }}>
                  <a 
                    href="https://wa.me/51900000000" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-whatsapp-direct"
                  >
                    <img src={whatsappGif} alt="WhatsApp" className="whatsapp-contact-icon" />
                    <span>{t('contact.page.openWhatsApp')}</span>
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Sidebar Indices Sticky */}
          <aside className="about-fiis-sidebar">
            <h4 className="sidebar-title">{t('contact.page.sidebarTitle')}</h4>
            <ul className="sidebar-menu">
              <li>
                <a 
                  href="#contacto-form-section" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('contacto-form-section'); }} 
                  className={`sidebar-link ${activeSection === 'contacto-form-section' ? 'active' : ''}`}
                >
                  {t('nav.email')}
                </a>
              </li>
              <li>
                <a 
                  href="#whatsapp-contact-section" 
                  onClick={(e) => { e.preventDefault(); handleScrollToSection('whatsapp-contact-section'); }} 
                  className={`sidebar-link ${activeSection === 'whatsapp-contact-section' ? 'active' : ''}`}
                >
                  {t('contact.page.directWhatsApp')}
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
            title={t('contact.page.backToTop')}
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
                <li><a href="https://www.sistemasunas.edu.pe/departamentos-academicos" target="_blank" rel="noopener noreferrer">{t('footer.academicDepartments')}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t('footer.researchTitle')}</h4>
              <ul>
                <li><a href="https://investigacion.unas.edu.pe" target="_blank" rel="noopener noreferrer">{t('footer.generalDirection')}</a></li>
                <li><a href="https://investigacion.unas.edu.pe/documentos-normativos" target="_blank" rel="noopener noreferrer">{t('footer.regulatoryDocuments')}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t('footer.supportTitle')}</h4>
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
