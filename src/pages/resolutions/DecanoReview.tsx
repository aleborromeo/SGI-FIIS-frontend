import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { tramiteService } from '../../services/tramiteService';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import type { Tramite } from '../../types/tramites';
import { getTipoTramiteLabel } from '../../utils/tramiteLabels';

export const DecanoReview: React.FC = () => {
  const { t } = useTranslation('resolutions');
  const navigate = useNavigate();
  const toast = useToast();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTramites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tramiteService.getPendingForRole('DECANO');
      setTramites(data.filter(t => t.estadoActual === 'PENDIENTE_DECANATO'));
    } catch (err: any) {
      setError(err.message || t('decanoReview.error.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTramites();
  }, []);

  const handleApprove = (tramite: Tramite) => {
    const params = new URLSearchParams({
      procedureId: String(tramite.id),
      title: tramite.tituloReferencia || tramite.codigoTramite,
    });
    navigate(`/resolutions/new-legacy?${params.toString()}`);
  };

  const handleObserve = async (tramite: Tramite) => {
    const obs = window.prompt(t('decanoReview.prompt.observerDetail'));
    if (obs === null) return;
    if (!obs.trim()) {
      toast.error(t('decanoReview.toast.observationRequired'));
      return;
    }

    try {
      setSubmitting(true);
      await tramiteService.flag(tramite.id, obs.trim());
      toast.success(t('decanoReview.toast.observed', { code: tramite.codigoTramite }));
      await loadTramites();
    } catch (err: any) {
      toast.error(err.message || t('decanoReview.toast.observeError'));
    } finally {
      setSubmitting(false);
    }
  };



  const formatFecha = (iso: string): string =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="animate-fade-in" style={{ padding: '28px', width: '100%', maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} style={{ color: 'white' }} />
          </span>
          {t('decanoReview.header.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginLeft: '54px' }}>
          {t('decanoReview.header.subtitle')}
        </p>
      </div>

      {error && (
        <Card style={{ marginBottom: '20px', borderLeft: '4px solid var(--error)' }}>
          <CardContent>
            <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
            <Button variant="secondary" onClick={loadTramites} style={{ marginTop: '12px' }}>
              {t('decanoReview.retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                {t('decanoReview.table.title', { count: tramites.length })}
              </h3>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <TableHeader>{t('decanoReview.table.headers.code')}</TableHeader>
                    <TableHeader>{t('decanoReview.table.headers.type')}</TableHeader>
                    <TableHeader>{t('decanoReview.table.headers.reference')}</TableHeader>
                    <TableHeader>{t('decanoReview.table.headers.status')}</TableHeader>
                    <TableHeader>{t('decanoReview.table.headers.lastUpdate')}</TableHeader>
                    <TableHeader style={{ textAlign: 'right' }}>{t('decanoReview.table.headers.action')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                        <Spinner size="small" />
                      </td>
                    </TableRow>
                  ) : tramites.length === 0 ? (
                    <TableRow>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                        {t('decanoReview.table.emptyState')}
                      </td>
                    </TableRow>
                  ) : (
                    tramites.map(tramite => (
                      <TableRow key={tramite.id}>
                        <TableCell>
                          <strong>{tramite.codigoTramite}</strong>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">{getTipoTramiteLabel(tramite.tipoTramite, t)}</Badge>
                        </TableCell>
                        <TableCell style={{ maxWidth: '280px', fontSize: '13px' }}>{tramite.tituloReferencia}</TableCell>
                        <TableCell>
                          <Badge variant="warning">{t('decanoReview.status.pendingDecanato')}</Badge>
                        </TableCell>
                        <TableCell style={{ fontSize: '13px' }}>{formatFecha(tramite.fechaActualizacion)}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="primary"
                              onClick={() => handleApprove(tramite)}
                              disabled={submitting}
                              icon={<FileText size={14} />}
                              style={{ padding: '4px 12px', fontSize: '12px' }}
                            >
                              {t('decanoReview.actions.sign')}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleObserve(tramite)}
                              disabled={submitting}
                              style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--error)', borderColor: 'var(--error)' }}
                            >
                              {t('decanoReview.actions.observe')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DecanoReview;
