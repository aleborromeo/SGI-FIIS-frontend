import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/common/Spinner';
import { TramiteStatusBadge } from '../../components/business/TramiteStatusBadge';
import {
  getEstadoObservacionLabel,
  getEstadoObservacionVariant,
  getRolLabel,
  getTipoObservacionLabel,
  getTipoTramiteLabel,
} from '../../utils/tramiteLabels';
import { ArrowLeft, CheckCircle, Paperclip, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { tramiteService } from '../../services/tramiteService';
import type { ObservacionTramite, Tramite } from '../../types/tramites';

const formatFechaHora = (iso: string): string =>
  new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface FormularioSubsanacion {
  descripcion: string;
  archivo: File | null;
  error?: string;
}

export const SubsanacionPanel: React.FC = () => {
  const { t } = useTranslation('observations');
  const location = useLocation();
  const tramiteId = Number(new URLSearchParams(location.search).get('tramiteId'));

  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [observaciones, setObservaciones] = useState<ObservacionTramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formularios, setFormularios] = useState<Record<number, FormularioSubsanacion>>({});
  const [enviandoId, setEnviandoId] = useState<number | null>(null);

  const cargarDatos = useCallback(() => {
    return Promise.all([
      tramiteService.getById(tramiteId),
      tramiteService.getObservacionesByTramite(tramiteId),
    ])
      .then(([dataTramite, dataObservaciones]) => {
        setTramite(dataTramite);
        setObservaciones(dataObservaciones);
      })
      .catch((err: Error) => setError(err.message || t('subsancion.toast.loadError')));
  }, [tramiteId]);

  useEffect(() => {
    if (!Number.isFinite(tramiteId) || tramiteId <= 0) {
      setError(t('subsancion.noTramite'));
      setLoading(false);
      return;
    }
    cargarDatos().finally(() => setLoading(false));
  }, [tramiteId, cargarDatos]);

  const actualizarFormulario = (idObservacion: number, cambios: Partial<FormularioSubsanacion>) => {
    setFormularios((prev) => {
      const actual = prev[idObservacion] ?? { descripcion: '', archivo: null };
      return { ...prev, [idObservacion]: { ...actual, ...cambios } };
    });
  };

  const handleSubsanar = (idObservacion: number) => {
    const formulario = formularios[idObservacion];
    const descripcion = formulario?.descripcion?.trim() ?? '';
    if (!descripcion) {
      actualizarFormulario(idObservacion, { error: t('subsancion.form.descriptionRequired') });
      return;
    }
    setEnviandoId(idObservacion);
    setFeedback(null);
    tramiteService.subsanarObservacion(idObservacion, descripcion, formulario?.archivo ?? null)
      .then(() => cargarDatos())
      .then(() => {
        setFeedback(t('subsancion.toast.success'));
        setFormularios((prev) => {
          const siguiente = { ...prev };
          delete siguiente[idObservacion];
          return siguiente;
        });
      })
      .catch((err: Error) => setError(err.message || t('subsancion.toast.error')))
      .finally(() => setEnviandoId(null));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !tramite) {
    return (
      <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error || t('subsancion.tramiteNotFound')}</div>
        <Link to="/tramites">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>{t('subsancion.backToTray')}</Button>
        </Link>
      </div>
    );
  }

  const pendientes = observaciones.filter((o) => o.estadoObservacion === 'PENDIENTE');

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link to={`/tramites/${tramite.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '8px' }} className="text-label-md">
            <ArrowLeft size={16} /> {t('subsancion.backToDetail')}
          </Link>
          <h1 className="text-headline-lg">{t('subsancion.title')}</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {tramite.codigoTramite} · {getTipoTramiteLabel(tramite.tipoTramite, t)} — {tramite.tituloReferencia}
          </p>
        </div>
        <TramiteStatusBadge estado={tramite.estadoActual} />
      </div>

      {feedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '24px', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle size={18} color="var(--primary)" />
          <span className="text-body-md">{feedback}</span>
        </div>
      )}

      {tramite.estadoActual !== 'OBSERVADO' && pendientes.length === 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="warning" title={t('subsancion.noPendingTitle')}>
            {t('subsancion.noPendingDescription')}
          </Alert>
        </div>
      )}

      {observaciones.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: '16px' }}>
              {t('subsancion.noObservations')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {observaciones.map((obs) => {
            const formulario = formularios[obs.id];
            const esPendiente = obs.estadoObservacion === 'PENDIENTE';
            return (
              <Card key={obs.id}>
                <CardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge variant="neutral">{getTipoObservacionLabel(obs.tipoObservacion, t)}</Badge>
                      <Badge variant={getEstadoObservacionVariant(obs.estadoObservacion)}>
                        {getEstadoObservacionLabel(obs.estadoObservacion, t)}
                      </Badge>
                    </div>
                    <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>
                      {getRolLabel(obs.rolRevisor, t)} · {formatFechaHora(obs.fechaRegistro)}
                    </span>
                  </div>

                  <p className="text-body-md" style={{ marginBottom: '16px' }}>{obs.descripcion}</p>

                  {/* Subsanaciones ya registradas */}
                  {obs.subsanaciones.map((sub) => (
                    <div key={sub.id} style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px' }}>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                        {t('subsancion.yourRemedy')} · {formatFechaHora(sub.fechaRegistro)}
                      </div>
                      <p className="text-body-md" style={{ margin: 0 }}>{sub.descripcion}</p>
                      {sub.nombreDocumentoAdjunto && (
                        <div className="text-caption" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Paperclip size={12} /> {sub.nombreDocumentoAdjunto}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Formulario de subsanación por observación */}
                  {esPendiente && (
                    <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Textarea
                        label={t('subsancion.form.description')}
                        rows={3}
                        placeholder={t('subsancion.form.descriptionPlaceholder')}
                        value={formulario?.descripcion ?? ''}
                        error={formulario?.error}
                        onChange={(e) => actualizarFormulario(obs.id, { descripcion: e.target.value, error: undefined })}
                      />
                      <div>
                        <label className="label" htmlFor={`archivo-obs-${obs.id}`}>{t('subsancion.form.document')}</label>
                        <input
                          id={`archivo-obs-${obs.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="input"
                          onChange={(e) => actualizarFormulario(obs.id, { archivo: e.target.files?.[0] ?? null })}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          icon={<Send size={16} />}
                          disabled={enviandoId === obs.id}
                          onClick={() => handleSubsanar(obs.id)}
                        >
                          {enviandoId === obs.id ? t('subsancion.form.registering') : t('subsancion.form.register')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
