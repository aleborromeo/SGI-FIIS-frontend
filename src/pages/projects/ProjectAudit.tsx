import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  FileText,
  FolderOpen,
  Printer,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/ui/Pagination';
import { auditService, type TraceabilityMovement } from '../../services/auditService';
import { documentService, type Document } from '../../services/documentService';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: '' };
  return {
    date: formatDate(iso),
    time: d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
  };
}

function getActionVariant(action: string): 'success' | 'warning' | 'info' {
  const a = action.toUpperCase();
  if (a.includes('APROB') || a.includes('REGISTR') || a.includes('CREAD') || a.includes('ENVI')) return 'success';
  if (a.includes('OBSERV') || a.includes('RECHAZ') || a.includes('FLAG')) return 'warning';
  return 'info';
}

function getDocumentVariant(status: string): 'success' | 'warning' | 'neutral' {
  const s = status.toUpperCase();
  if (s === 'VIGENTE' || s === 'ACTIVE' || s === 'APROBADO') return 'success';
  if (s === 'OBSERVADO' || s === 'PENDIENTE') return 'warning';
  return 'neutral';
}

const PAGE_SIZE = 10;

export const ProjectAudit: React.FC = () => {
  const { t } = useTranslation('projects');
  const [searchParams] = useSearchParams();
  const procedureId = Number(searchParams.get('procedureId') || searchParams.get('id') || '1');

  const [movements, setMovements] = useState<TraceabilityMovement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const [docsPage, setDocsPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movs, docs] = await Promise.all([
        auditService.getTraceability(procedureId).catch(() => []),
        documentService.list().catch(() => []),
      ]);
      setMovements(movs);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || t('projects:audit.loadError', { defaultValue: 'Error al cargar datos de auditoría' }));
    } finally {
      setLoading(false);
    }
  }, [procedureId, t]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredMovements = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return movements;
    return movements.filter((m) =>
      m.actionUserName.toLowerCase().includes(s) ||
      m.action.toLowerCase().includes(s) ||
      m.procedureCode.toLowerCase().includes(s) ||
      (m.observation ?? '').toLowerCase().includes(s)
    );
  }, [movements, searchTerm]);

  const filteredDocuments = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return documents;
    return documents.filter((d) =>
      d.fileName.toLowerCase().includes(s) ||
      d.fileType.toLowerCase().includes(s)
    );
  }, [documents, searchTerm]);

  const eventsTotalPages = Math.ceil(filteredMovements.length / PAGE_SIZE);
  const pagedEvents = filteredMovements.slice((eventsPage - 1) * PAGE_SIZE, eventsPage * PAGE_SIZE);

  const docsTotalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE);
  const pagedDocuments = filteredDocuments.slice((docsPage - 1) * PAGE_SIZE, docsPage * PAGE_SIZE);

  useEffect(() => { setEventsPage(1); setDocsPage(1); }, [searchTerm]);

  const uniqueParticipants = useMemo(() => {
    const map = new Map<string, { name: string; actions: number }>();
    movements.forEach((m) => {
      const existing = map.get(m.actionUserName);
      if (existing) existing.actions++;
      else map.set(m.actionUserName, { name: m.actionUserName, actions: 1 });
    });
    return Array.from(map.values());
  }, [movements]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', marginBottom: '28px', gap: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
          <input
            type="text"
            placeholder={t('projects:audit.searchPlaceholder', { defaultValue: 'Buscar en auditoría...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> {t('projects:audit.backToProjects', { defaultValue: 'Volver a Proyectos' })}
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Badge variant="info">#{procedureId}</Badge>
            <Badge variant="success">{t('projects:audit.activeFile', { defaultValue: 'Expediente Activo' })}</Badge>
          </div>
          <h1 className="text-headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>
            {t('projects:audit.pageTitle', { defaultValue: 'Auditoría del Expediente' })}
          </h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '820px' }}>
            {t('projects:audit.pageSubtitle', { defaultValue: 'Trazabilidad completa de movimientos, documentos y participantes del trámite.' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>
            {t('projects:audit.print', { defaultValue: 'Imprimir' })}
          </Button>
        </div>
      </div>

      {error && (
        <Card style={{ marginBottom: '20px', borderLeft: '4px solid var(--error)' }}>
          <CardContent>
            <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
            <Button variant="secondary" onClick={loadData} style={{ marginTop: '12px' }}>
              {t('projects:audit.retry', { defaultValue: 'Reintentar' })}
            </Button>
          </CardContent>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px', overflowX: 'auto' }}>
        <Link to="/projects/audit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
          <FolderOpen size={18} /> {t('projects:audit.navExpediente', { defaultValue: 'Expediente' })}
        </Link>
        <Link to={`/tramites/${procedureId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <BarChart3 size={18} /> {t('projects:audit.navTramite', { defaultValue: 'Trámite' })}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <Card>
          <CardContent>
            <ShieldCheck size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>{movements.length}</strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.movements', { defaultValue: 'Movimientos' })}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <FileText size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>{documents.length}</strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.documentsCount', { defaultValue: 'Documentos' })}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Users size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>{uniqueParticipants.length}</strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.participantsCount', { defaultValue: 'Participantes' })}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CheckCircle size={24} color="#15803d" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>
              {movements.length > 0 ? movements[movements.length - 1].newStatus : '-'}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.currentStatus', { defaultValue: 'Estado Actual' })}</span>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <Card>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} /> {t('projects:audit.documentsTitle', { defaultValue: 'Documentos del Expediente' })}
              </h2>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredDocuments.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.noDocumentsFound', { defaultValue: 'No hay documentos registrados.' })}</p>
                ) : (
                  pagedDocuments.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={22} color="var(--primary)" />
                        </div>
                        <div>
                          <strong style={{ display: 'block' }}>{doc.fileName}</strong>
                          <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>
                            ID: {doc.id} · {doc.fileType} · {doc.uploadedAt ? formatDate(doc.uploadedAt) : '-'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant={getDocumentVariant(doc.active ? 'VIGENTE' : 'INACTIVO')}>{doc.active ? 'Vigente' : 'Inactivo'}</Badge>
                        <Button variant="secondary" style={{ padding: '6px 10px' }} icon={<Download size={16} />}
                          onClick={() => documentService.downloadFile(doc.id, doc.fileName)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Pagination currentPage={docsPage} totalPages={docsTotalPages} totalItems={filteredDocuments.length} pageSize={PAGE_SIZE} onPageChange={setDocsPage} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> {t('projects:audit.participantsTitle', { defaultValue: 'Participantes' })}
              </h2>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '12px' }}>
                {uniqueParticipants.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)' }}>{t('projects:audit.noParticipants', { defaultValue: 'No hay participantes registrados.' })}</p>
                ) : (
                  uniqueParticipants.map((p) => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <strong style={{ display: 'block' }}>{p.name}</strong>
                        <span className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>{p.actions} {t('projects:audit.actions', { defaultValue: 'acción(ones)' })}</span>
                      </div>
                      <Badge variant="info">{t('projects:audit.participant', { defaultValue: 'Participante' })}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <CardHeader style={{ backgroundColor: '#111827', color: 'white' }}>
            <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> {t('projects:audit.auditTitle', { defaultValue: 'Registro de Auditoría' })}
            </h2>
          </CardHeader>
          <CardContent style={{ backgroundColor: '#111827', color: '#e5e7eb', paddingTop: '24px', minHeight: '100%' }}>
            <div style={{ display: 'grid', gap: '18px' }}>
              {filteredMovements.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>{t('projects:audit.noMovementsFound', { defaultValue: 'No hay movimientos registrados.' })}</p>
              ) : (
                pagedEvents.map((mov) => {
                  const variant = getActionVariant(mov.action);
                  const dt = formatDateTime(mov.movementDate);
                  return (
                    <div key={mov.movementId} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: '12px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '999px', marginTop: '4px', backgroundColor: variant === 'success' ? '#22c55e' : variant === 'warning' ? '#f59e0b' : '#60a5fa' }} />
                      <div style={{ paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                          <strong style={{ color: 'white' }}>{mov.action}</strong>
                          <Badge variant={variant}>{mov.previousStatus} → {mov.newStatus}</Badge>
                        </div>
                        {mov.observation && <p style={{ color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>{mov.observation}</p>}
                        <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
                          <Clock size={14} /> {dt.date} · {dt.time} · {mov.actionUserName}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Pagination currentPage={eventsPage} totalPages={eventsTotalPages} totalItems={filteredMovements.length} pageSize={PAGE_SIZE} onPageChange={setEventsPage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectAudit;
