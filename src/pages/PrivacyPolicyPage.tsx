import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './PrivacyPolicyPage.css';
import universityIcon from '../assets/images/icon-sgi-fiis.png';

type LegalSection = 'terminos' | 'privacidad' | 'derechos-autor' | 'cookies' | 'cambios' | 'eventos';

const getSectionFromSearch = (search: string): LegalSection => {
  const params = new URLSearchParams(search);
  return params.get('tab') === 'terminos' ? 'terminos' : 'privacidad';
};

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('public');

  const [activeTab, setActiveTab] = useState<LegalSection>(() => getSectionFromSearch(location.search));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(getSectionFromSearch(location.search));
  }, [location.search]);

  const sections = useMemo(
    () => ({
      terminos: {
        title: t('privacyPage.terms.title'),
        subtitle: t('privacyPage.updatedAt'),
        items: [
          { letter: 'a', body: t('privacyPage.terms.items.a') },
          { letter: 'b', body: t('privacyPage.terms.items.b') },
          { letter: 'c', body: t('privacyPage.terms.items.c') },
        ],
      },
      privacidad: {
        title: t('privacyPage.privacy.title'),
        subtitle: t('privacyPage.updatedAt'),
        intro: t('privacyPage.privacy.intro'),
        items: [
          { letter: 'a', body: t('privacyPage.privacy.items.a') },
          { letter: 'b', body: t('privacyPage.privacy.items.b') },
          { letter: 'c', body: t('privacyPage.privacy.items.c') },
          { letter: 'd', body: t('privacyPage.privacy.items.d') },
          {
            letter: 'e',
            body: (
              <>
                {t('privacyPage.privacy.items.e')}{' '}
                <a href={`mailto:${t('privacyPage.contact.email')}`} className="privacy-contact-link">
                  {t('privacyPage.contact.email')}
                </a>
                .
              </>
            ),
          },
        ],
      },
      'derechos-autor': {
        title: t('privacyPage.copyright.title'),
        subtitle: t('privacyPage.updatedAt'),
        items: [
          { letter: 'a', body: t('privacyPage.copyright.items.a') },
          { letter: 'b', body: t('privacyPage.copyright.items.b') },
        ],
      },
      cookies: {
        title: t('privacyPage.cookies.title'),
        subtitle: t('privacyPage.updatedAt'),
        items: [
          { letter: 'a', body: t('privacyPage.cookies.items.a') },
          { letter: 'b', body: t('privacyPage.cookies.items.b') },
        ],
      },
      cambios: {
        title: t('privacyPage.changes.title'),
        subtitle: t('privacyPage.updatedAt'),
        items: [{ letter: 'a', body: t('privacyPage.changes.items.a') }],
      },
      eventos: {
        title: t('privacyPage.events.title'),
        subtitle: t('privacyPage.updatedAt'),
        items: [{ letter: 'a', body: t('privacyPage.events.items.a') }],
      },
    }),
    [t],
  );

  const currentSection = sections[activeTab];

  const goToSection = (section: LegalSection) => {
    setActiveTab(section);
    navigate(section === 'terminos' ? '/privacy-policy?tab=terminos' : '/privacy-policy', { replace: true });
  };

  return (
    <div className="privacy-page-wrapper">
      <header className="privacy-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="privacy-logo-container" onClick={() => navigate('/')}>
          <img src={universityIcon} alt="SGI Logo" className="privacy-logo-img" />
          <span className="privacy-logo-text">SGI FIIS</span>
        </div>
      </header>

      <main className="privacy-main-layout">
        <aside className="privacy-sidebar">
          <ul className="privacy-sidebar-list">
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'terminos' ? 'active' : ''}`} onClick={() => goToSection('terminos')}>
                {t('privacyPage.sidebar.terms')}
              </button>
            </li>
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'privacidad' ? 'active' : ''}`} onClick={() => goToSection('privacidad')}>
                {t('privacyPage.sidebar.privacy')}
              </button>
            </li>
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'derechos-autor' ? 'active' : ''}`} onClick={() => goToSection('derechos-autor')}>
                {t('privacyPage.sidebar.copyright')}
              </button>
            </li>
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'cookies' ? 'active' : ''}`} onClick={() => goToSection('cookies')}>
                {t('privacyPage.sidebar.cookies')}
              </button>
            </li>
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'cambios' ? 'active' : ''}`} onClick={() => goToSection('cambios')}>
                {t('privacyPage.sidebar.changes')}
              </button>
            </li>
            <li>
              <button className={`privacy-sidebar-item ${activeTab === 'eventos' ? 'active' : ''}`} onClick={() => goToSection('eventos')}>
                {t('privacyPage.sidebar.events')}
              </button>
            </li>
          </ul>
        </aside>

        <section className="privacy-content-area">
          <div>
            <h1 className="privacy-title">{currentSection.title}</h1>
            <p className="privacy-subtitle">{currentSection.subtitle}</p>

            {'intro' in currentSection && currentSection.intro && <p className="privacy-intro-text">{currentSection.intro}</p>}

            <div className="privacy-paragraph-list">
              {currentSection.items.map((item) => (
                <div className="privacy-paragraph-item" key={`${activeTab}-${item.letter}`}>
                  <span className="privacy-paragraph-letter">{item.letter}.</span>
                  <p className="privacy-paragraph-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="privacy-footer">
        <div className="privacy-footer-content">
          <span>{t('privacyPage.footer.copyright')}</span>
          <div className="privacy-footer-links">
            <span className="privacy-footer-link" onClick={() => goToSection('privacidad')}>
              {t('privacyPage.sidebar.privacy')}
            </span>
            <span>|</span>
            <span className="privacy-footer-link" onClick={() => goToSection('terminos')}>
              {t('privacyPage.sidebar.terms')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
