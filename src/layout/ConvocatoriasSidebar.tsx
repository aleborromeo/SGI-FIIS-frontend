import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, X, Calendar, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { callService, type CallResponse } from '../services/callService';

export function ConvocatoriasSidebar() {
  const { currentRole } = useContext(AuthContext);
  const { t } = useTranslation('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    if (calls.length === 0 && !loading) {
      setLoading(true);
      callService
        .getVigent()
        .then((data) => setCalls(data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  if (currentRole !== 'DOCENTE_INVESTIGADOR') return null;

  return (
    <>
      <div className="sidebar-convocatorias-section">
        <button
          type="button"
          className="sidebar-convocatorias-btn"
          onClick={handleOpen}
        >
          <Megaphone size={18} />
          <span>{t('navigation:convocatoriasVigentes')}</span>
        </button>
      </div>

      {isOpen && (
        <div className="convocatorias-overlay" onClick={() => setIsOpen(false)}>
          <div className="convocatorias-modal" onClick={(e) => e.stopPropagation()}>
            <div className="convocatorias-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Megaphone size={22} style={{ color: 'var(--primary)' }} />
                <h2>{t('navigation:convocatoriasVigentes')}</h2>
              </div>
              <button
                type="button"
                className="convocatorias-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label={t('navigation:convocatoriaCerrar')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="convocatorias-modal-body">
              {loading ? (
                <div className="convocatorias-empty">
                  <p>{t('navigation:convocatoriasLoading')}</p>
                </div>
              ) : calls.length === 0 ? (
                <div className="convocatorias-empty">
                  <Calendar size={40} style={{ opacity: 0.35, marginBottom: '8px' }} />
                  <p>{t('navigation:convocatoriasNoOpen')}</p>
                </div>
              ) : (
                <div className="convocatorias-grid">
                  {calls.map((call) => (
                    <div key={call.id} className="convocatoria-card">
                      <div>
                        <div className="convocatoria-card-top">
                          <span className="convocatoria-code">CONV-{call.id}</span>
                          <span className="convocatoria-status">{call.status}</span>
                        </div>
                        <h4 className="convocatoria-title">{call.title}</h4>
                        <p className="convocatoria-desc">{call.description}</p>
                      </div>
                      <div>
                        <div className="convocatoria-dates">
                          <div>
                            <span>{t('navigation:convocatoriaInicio')}</span>
                            <strong>{call.startDate}</strong>
                          </div>
                          <div>
                            <span>{t('navigation:convocatoriaCierre')}</span>
                            <strong>{call.endDate}</strong>
                          </div>
                        </div>
                        <Link
                          to={`/projects/new?callId=${call.id}`}
                          onClick={() => setIsOpen(false)}
                          className="convocatoria-postular-btn"
                        >
                          <FileText size={16} />
                          {t('navigation:convocatoriaPostular')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
