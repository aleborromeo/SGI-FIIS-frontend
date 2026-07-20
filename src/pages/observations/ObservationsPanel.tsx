import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileUp,
  MessageSquare,
  RefreshCcw,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import {
  observationService,
  type Observation,
} from '../../services/observationService';
import { documentService } from '../../services/documentService';

function getStatusLabel(status?: string, t?: (key: string) => string): string {
  if (!status) return t ? t('panel.statuses.pending') : 'Pendiente';

  const normalized = status.toUpperCase();

  const dictionary: Record<string, string> = {
    PENDING: t ? t('panel.statuses.pending') : 'Pendiente',
    PENDIENTE: t ? t('panel.statuses.pending') : 'Pendiente',
    OBSERVED: t ? t('panel.statuses.observed') : 'Observado',
    OBSERVADO: t ? t('panel.statuses.observed') : 'Observado',
    SUBSANADO: t ? t('panel.statuses.remediated') : 'Subsanado',
    REMEDIED: t ? t('panel.statuses.remediated') : 'Subsanado',
    RESUELTO: t ? t('panel.statuses.resolved') : 'Resuelto',
    RESOLVED: t ? t('panel.statuses.resolved') : 'Resuelto',
    CLOSED: t ? t('panel.statuses.closed') : 'Cerrado',
    CERRADO: t ? t('panel.statuses.closed') : 'Cerrado',
  };

  return dictionary[normalized] ?? status;
}

function isResolved(status?: string): boolean {
  const normalized = String(status ?? '').toUpperCase();

  return ['SUBSANADO', 'REMEDIED', 'RESUELTO', 'RESOLVED', 'CLOSED', 'CERRADO'].includes(
    normalized
  );
}

function formatDate(value?: string, noDateLabel?: string): string {
  if (!value) return noDateLabel ?? 'Sin fecha';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export const ObservationsPanel: React.FC = () => {
  const { t } = useTranslation('observations');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const procedureId = queryParams.get('procedureId');

  const [justification, setJustification] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const pendingObservations = useMemo(() => {
    return observations.filter((observation) => !isResolved(observation.status));
  }, [observations]);

  const resolvedObservations = observations.length - pendingObservations.length;
  const hasPendingObservations = pendingObservations.length > 0;

  async function loadObservations() {
    try {
      setLoading(true);
      setError(null);

      let response: Observation[];
      if (procedureId) {
        response = await observationService.getByProcedureId(procedureId);
      } else {
        response = await observationService.getMyObservations();
      }

      setObservations(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar observaciones:', err);

      setError(
        err instanceof Error
          ? err.message
          : t('panel.loadErrorDetail')
      );

      setObservations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadObservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedureId]);

  async function handleRemedySubmit() {
    if (!justification.trim()) {
      toast.warning(t('panel.toast.justificationRequired'));
      return;
    }
    
    const pendingObs = observations.filter(o => !isResolved(o.status));
    if (pendingObs.length === 0) {
      toast.info(t('panel.toast.noPendingObservations'));
      return;
    }

    setSubmitting(true);
    try {
      let attachedDocumentId: number | undefined;
      if (selectedFile) {
        const uploaded = await documentService.upload(selectedFile);
        attachedDocumentId = uploaded.id;
      }
      for (const obs of pendingObs) {
        const userStr = localStorage.getItem('sgi_user');
        const user = userStr ? JSON.parse(userStr) : { id: 1 };
        await observationService.addRemedy(obs.id, {
          applicantId: user.id,
          description: justification,
          attachedDocumentId,
        });
      }
      toast.success(t('panel.toast.remedySuccess'));
      setJustification('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadObservations();
    } catch (err) {
      console.error('Error al subsanar', err);
      toast.error(t('panel.toast.remedyError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '64px',
      }}
    >
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--on-surface-variant)',
          textDecoration: 'none',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        {t('panel.backToDashboard')}
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="text-headline-lg">{t('panel.myObservations')}</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
              maxWidth: '760px',
            }}
          >
            {t('panel.description')}
          </p>
        </div>

        <Badge variant={hasPendingObservations ? 'error' : 'success'}>
          {hasPendingObservations ? t('panel.requiresRemedy') : t('panel.allCompliant')}
        </Badge>
      </div>

      {!procedureId && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--on-surface-variant)' }}>
            <p style={{ fontSize: '16px' }}>
              Seleccione un expediente o trámite desde el módulo correspondiente para ver sus observaciones.
            </p>
          </CardContent>
        </Card>
      )}

      {procedureId && (<>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {observations.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('panel.registeredObservations')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {pendingObservations.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('panel.pendingRemedy')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {resolvedObservations}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('panel.remediatedOrClosed')}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '4px',
                }}
              >
                {t('panel.procedure')}
              </div>

              <div className="text-title-lg">{procedureId}</div>
            </div>

            <Button
              variant="secondary"
              icon={<RefreshCcw size={16} />}
              onClick={loadObservations}
              disabled={loading}
            >
              {loading ? t('panel.updating') : t('panel.update')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert title={t('panel.loadErrorTitle')}>
          {t('panel.loadErrorDetail', { error })}. {t('panel.loadErrorEndpoint', { procedureId })}
        </Alert>
      )}

      <div
        className="responsive-grid-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '32px',
          marginTop: error ? '24px' : 0,
        }}
      >
        <div>
          <h3
            className="text-title-lg"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <MessageSquare size={20} />
            {t('panel.observationDetail')}
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {loading ? (
              <Card>
                <CardContent>
                  <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
                    {t('panel.loading')}
                  </p>
                </CardContent>
              </Card>
            ) : observations.length === 0 ? (
              <Card>
                <CardContent>
                  <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
                    {t('panel.noObservations')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              observations.map((observation) => {
                const resolved = isResolved(observation.status);

                return (
                  <Card key={observation.id}>
                    <CardContent>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '16px',
                          marginBottom: '12px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '6px',
                            }}
                          >
                            {resolved ? (
                              <CheckCircle size={18} color="#15803d" />
                            ) : (
                              <AlertCircle size={18} color="#b45309" />
                            )}

                            <strong>
                              {observation.type || t('panel.generalObservation')}
                            </strong>
                          </div>

                          <div
                            className="text-caption"
                            style={{ color: 'var(--on-surface-variant)' }}
                          >
                            {t('panel.registeredDate', { date: formatDate(observation.createdAt, t('panel.noDate')) })}
                          </div>
                        </div>

                        <Badge variant={resolved ? 'success' : 'warning'}>
                          {getStatusLabel(observation.status, t)}
                        </Badge>
                      </div>

                      <p
                        style={{
                          color: 'var(--on-surface-variant)',
                          lineHeight: 1.6,
                          marginBottom: observation.remedy ? '14px' : 0,
                        }}
                      >
                        {observation.description || t('panel.noDetail')}
                      </p>

                      {observation.remedy && (
                        <div
                          style={{
                            padding: '14px',
                            borderRadius: '12px',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #bbf7d0',
                            color: '#14532d',
                          }}
                        >
                          <strong style={{ display: 'block', marginBottom: '4px' }}>
                            {t('panel.responseRegistered')}
                          </strong>
                          <span>{observation.remedy}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h3
            className="text-title-lg"
            style={{
              marginBottom: '16px',
            }}
          >
            {t('panel.sendRemedy')}
          </h3>

          <Card
            style={{
              opacity: hasPendingObservations ? 1 : 0.65,
            }}
          >
            <CardContent>
              <p
                style={{
                  color: 'var(--on-surface-variant)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                }}
              >
              {t('panel.remedyDescription')}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: '8px',
                  }}
                >
                  {t('panel.correctedDocument')}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  disabled={!hasPendingObservations}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!hasPendingObservations}
                  style={{
                    width: '100%',
                    border: '2px dashed var(--outline-variant)',
                    borderRadius: '14px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface-container-lowest)',
                    cursor: hasPendingObservations ? 'pointer' : 'not-allowed',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  <FileUp
                    size={28}
                    style={{ margin: '0 auto 12px auto' }}
                  />

                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {t('panel.clickToUpload')}
                  </strong>

                  <span style={{ fontSize: '12px' }}>
                    {t('panel.fileInfo')}
                  </span>
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    marginBottom: '8px',
                  }}
                >
                  {t('panel.justificationLabel')}
                </label>

                <textarea
                  rows={5}
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  placeholder={t('panel.justificationPlaceholder')}
                  disabled={!hasPendingObservations}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--outline-variant)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    color: 'var(--on-surface)',
                    backgroundColor: hasPendingObservations
                      ? 'var(--surface)'
                      : 'var(--surface-container-low)',
                  }}
                />
              </div>

              <Button
                variant="primary"
                icon={<CheckCircle size={16} />}
                onClick={handleRemedySubmit}
                disabled={!hasPendingObservations || submitting}
                style={{ width: '100%' }}
              >
                {submitting ? t('panel.registering') : t('panel.registerRemedy')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </>)}
    </div>
  );
};

export default ObservationsPanel;