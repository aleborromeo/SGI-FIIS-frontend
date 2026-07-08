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
import { useToast } from '../../context/ToastContext';

import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import {
  observationService,
  type Observation,
} from '../../services/observationService';

function getStatusLabel(status?: string): string {
  if (!status) return 'Pendiente';

  const normalized = status.toUpperCase();

  const dictionary: Record<string, string> = {
    PENDING: 'Pendiente',
    PENDIENTE: 'Pendiente',
    OBSERVED: 'Observado',
    OBSERVADO: 'Observado',
    SUBSANADO: 'Subsanado',
    REMEDIED: 'Subsanado',
    RESUELTO: 'Resuelto',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    CERRADO: 'Cerrado',
  };

  return dictionary[normalized] ?? status;
}

function isResolved(status?: string): boolean {
  const normalized = String(status ?? '').toUpperCase();

  return ['SUBSANADO', 'REMEDIED', 'RESUELTO', 'RESOLVED', 'CLOSED', 'CERRADO'].includes(
    normalized
  );
}

function formatDate(value?: string): string {
  if (!value) return 'Sin fecha';

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const procedureId = queryParams.get('procedureId') || '1';

  const [justification, setJustification] = useState('');
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

      const response = await observationService.getByProcedureId(procedureId);

      setObservations(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar observaciones:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las observaciones.'
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
      toast.warning('Debe ingresar una justificación.');
      return;
    }
    
    const pendingObs = observations.filter(o => !isResolved(o.status));
    if (pendingObs.length === 0) {
      toast.info('No hay observaciones pendientes por subsanar.');
      return;
    }

    setSubmitting(true);
    try {
      for (const obs of pendingObs) {
        const userStr = localStorage.getItem('sgi_user');
        const user = userStr ? JSON.parse(userStr) : { id: 1 };
        await observationService.addRemedy(obs.id, {
          applicantId: user.id,
          description: justification
        });
      }
      toast.success('Subsanación registrada correctamente. El estado de la propuesta ha sido actualizado.');
      setJustification('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadObservations();
    } catch (err) {
      console.error('Error al subsanar', err);
      toast.error('Error al registrar la subsanación.');
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
        Volver al dashboard
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
          <h1 className="text-headline-lg">Mis observaciones</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
              maxWidth: '760px',
            }}
          >
            Consulta las observaciones asociadas a un trámite y registra la
            subsanación correspondiente cuando sea necesario.
          </p>
        </div>

        <Badge variant={hasPendingObservations ? 'error' : 'success'}>
          {hasPendingObservations ? 'Requiere subsanación' : 'Todo conforme'}
        </Badge>
      </div>

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
              Observaciones registradas
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {pendingObservations.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Pendientes de subsanar
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <strong style={{ display: 'block', fontSize: '28px' }}>
              {resolvedObservations}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              Subsanadas o cerradas
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
                Expediente / trámite
              </div>

              <div className="text-title-lg">{procedureId}</div>
            </div>

            <Button
              variant="secondary"
              icon={<RefreshCcw size={16} />}
              onClick={loadObservations}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert title="No se pudieron cargar las observaciones">
          El backend respondió: {error}. Verifica el endpoint
          GET /api/observations/procedure/{procedureId}.
        </Alert>
      )}

      <div
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
            Detalle de observaciones
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
                    Cargando observaciones...
                  </p>
                </CardContent>
              </Card>
            ) : observations.length === 0 ? (
              <Card>
                <CardContent>
                  <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
                    No hay observaciones registradas para este expediente.
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
                              {observation.type || 'Observación general'}
                            </strong>
                          </div>

                          <div
                            className="text-caption"
                            style={{ color: 'var(--on-surface-variant)' }}
                          >
                            Registrado: {formatDate(observation.createdAt)}
                          </div>
                        </div>

                        <Badge variant={resolved ? 'success' : 'warning'}>
                          {getStatusLabel(observation.status)}
                        </Badge>
                      </div>

                      <p
                        style={{
                          color: 'var(--on-surface-variant)',
                          lineHeight: 1.6,
                          marginBottom: observation.remedy ? '14px' : 0,
                        }}
                      >
                        {observation.content || 'Sin detalle registrado.'}
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
                            Respuesta registrada
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
            Enviar subsanación
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
                Adjunta el documento corregido y registra una respuesta clara a
                las observaciones pendientes.
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
                  Documento corregido
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  disabled={!hasPendingObservations}
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
                    Haz clic para subir archivo
                  </strong>

                  <span style={{ fontSize: '12px' }}>
                    PDF, DOC o DOCX hasta 10 MB
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
                  Justificación o respuesta
                </label>

                <textarea
                  rows={5}
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  placeholder="Detalla cómo se resolvieron las observaciones..."
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
                {submitting ? 'Registrando...' : 'Registrar subsanación'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObservationsPanel;