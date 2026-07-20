import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import i18n from './i18n';
import './index.css';
import App from './App.tsx';

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
