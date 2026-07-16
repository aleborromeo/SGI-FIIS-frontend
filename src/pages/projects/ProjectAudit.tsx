import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  FileText,
  FolderOpen,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  UploadCloud,
  UserCheck,
  Users,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';

interface AuditEvent {
  id: string;
  date: string;
  time: string;
  user: string;
  role: string;
  action: string;
  detail: string;
  status: 'success' | 'warning' | 'info';
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  owner: string;
  date: string;
  status: 'VIGENTE' | 'OBSERVADO' | 'HISTÓRICO';
}

interface Participant {
  id: string;
  name: string;
  role: string;
  email: string;
}

const auditEvents: AuditEvent[] = [
  {
    id: '1',
    date: '2026-07-01',
    time: '08:30',
    user: 'Admin Sistema',
    role: 'Administrador',
    action: 'Registro del expediente',
    detail: 'Se creó el expediente digital del proyecto para iniciar el flujo académico.',
    status: 'success',
  },
  {
    id: '2',
    date: '2026-07-02',
    time: '10:15',
    user: 'Jorge Castro',
    role: 'Evaluador',
    action: 'Asignación de revisores',
    detail: 'Se asignaron jurados para revisión técnica y académica del documento.',
    status: 'info',
  },
  {
    id: '3',
    date: '2026-07-03',
    time: '16:40',
    user: 'María Rojas',
    role: 'Docente investigador',
    action: 'Observación registrada',
    detail: 'Se solicitaron ajustes en metodología, cronograma y objetivos específicos.',
    status: 'warning',
  },
  {
    id: '4',
    date: '2026-07-04',
    time: '11:20',
    user: 'Carlos Mendoza',
    role: 'Coordinador',
    action: 'Subsanación recibida',
    detail: 'El equipo responsable registró una nueva versión del documento corregido.',
    status: 'success',
  },
];

const documents: DocumentItem[] = [
  {
    id: 'DOC-001',
    name: 'Plan de investigación',
    type: 'PDF',
    owner: 'Equipo responsable',
    date: '2026-07-01',
    status: 'VIGENTE',
  },
  {
    id: 'DOC-002',
    name: 'Cronograma de actividades',
    type: 'XLSX',
    owner: 'Coordinador de grupo',
    date: '2026-07-02',
    status: 'VIGENTE',
  },
  {
    id: 'DOC-003',
    name: 'Informe de observaciones',
    type: 'PDF',
    owner: 'Jurado evaluador',
    date: '2026-07-03',
    status: 'OBSERVADO',
  },
  {
    id: 'DOC-004',
    name: 'Versión anterior del plan',
    type: 'PDF',
    owner: 'Sistema',
    date: '2026-06-28',
    status: 'HISTÓRICO',
  },
];

const participants: Participant[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    role: 'Administrador',
    email: 'admin@unas.edu.pe',
  },
  {
    id: '2',
    name: 'Jorge Castro',
    role: 'Evaluador',
    email: 'jorge.castro@unas.edu.pe',
  },
  {
    id: '3',
    name: 'María Rojas',
    role: 'Docente investigador',
    email: 'maria.rojas@unas.edu.pe',
  },
];

function formatDate(value: string): string {
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

function getDocumentVariant(status: DocumentItem['status']): 'success' | 'warning' | 'neutral' {
  if (status === 'VIGENTE') return 'success';
  if (status === 'OBSERVADO') return 'warning';
  return 'neutral';
}

function getAuditVariant(status: AuditEvent['status']): 'success' | 'warning' | 'info' {
  return status;
}

export const ProjectAudit: React.FC = () => {
  const { t } = useTranslation('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const PAGE_SIZE = 10;
  const [eventsPage, setEventsPage] = useState(1);
  const [docsPage, setDocsPage] = useState(1);

  const filteredEvents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return auditEvents;

    return auditEvents.filter((event) => {
      return (
        event.user.toLowerCase().includes(search) ||
        event.role.toLowerCase().includes(search) ||
        event.action.toLowerCase().includes(search) ||
        event.detail.toLowerCase().includes(search) ||
        event.date.toLowerCase().includes(search)
      );
    });
  }, [searchTerm]);

  const eventsTotalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice(
    (eventsPage - 1) * PAGE_SIZE,
    eventsPage * PAGE_SIZE
  );

  const filteredDocuments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return documents;

    return documents.filter((document) => {
      return (
        document.name.toLowerCase().includes(search) ||
        document.owner.toLowerCase().includes(search) ||
        document.status.toLowerCase().includes(search) ||
        document.type.toLowerCase().includes(search)
      );
    });
  }, [searchTerm]);

  const docsTotalPages = Math.ceil(filteredDocuments.length / PAGE_SIZE);
  const pagedDocuments = filteredDocuments.slice(
    (docsPage - 1) * PAGE_SIZE,
    docsPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setEventsPage(1);
    setDocsPage(1);
  }, [searchTerm]);

  function handlePrint() {
    window.print();
  }

  function handleUpload() {
    setMessage(
      t('projects:audit.uploadPending')
    );
  }

  function handleDownloadLog() {
    setMessage(
      t('projects:audit.downloadPending')
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--outline-variant)',
          paddingBottom: '16px',
          marginBottom: '28px',
          gap: '24px',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '10px',
              color: 'var(--on-surface-variant)',
            }}
          />

          <input
            type="text"
            placeholder={t('projects:audit.searchPlaceholder')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Bell size={20} color="var(--on-surface-variant)" />
        </div>
      </div>

      <Link
        to="/projects"
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
        {t('projects:audit.backToProjects')}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <Badge variant="info">#EXP-2026-442</Badge>
            <Badge variant="success">{t('projects:audit.activeFile')}</Badge>
          </div>

          <h1
            className="text-headline-lg"
            style={{
              color: 'var(--on-surface)',
              marginBottom: '8px',
            }}
          >
            {t('projects:audit.pageTitle')}
          </h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              maxWidth: '820px',
            }}
          >
            {t('projects:audit.pageSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<Printer size={18} />}
            onClick={handlePrint}
          >
            {t('projects:audit.print')}
          </Button>

          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={handleUpload}
          >
            {t('projects:audit.uploadAnnex')}
          </Button>
        </div>
      </div>

      {message && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('projects:audit.actionRecorded')}>{message}</Alert>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--outline-variant)',
          paddingBottom: '16px',
          overflowX: 'auto',
        }}
      >
        <Link
          to="/projects/audit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <FolderOpen size={18} />
          {t('projects:audit.navExpediente')}
        </Link>

        <Link
          to="/projects/1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            color: 'var(--on-surface-variant)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <BarChart3 size={18} />
          {t('projects:audit.navSeguimiento')}
        </Link>

        <Link
          to="/thesis/plan/1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            color: 'var(--on-surface-variant)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <Activity size={18} />
          {t('projects:audit.navTrazabilidad')}
        </Link>

        <Link
          to="/projects/assign?projectId=1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            color: 'var(--on-surface-variant)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={18} />
          {t('projects:audit.navRevisores')}
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <Card>
          <CardContent>
            <ShieldCheck size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>
              {auditEvents.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('projects:audit.movements')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <FileText size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>
              {documents.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('projects:audit.documentsCount')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <UserCheck size={24} color="var(--primary)" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>
              {participants.length}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('projects:audit.participantsCount')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <CheckCircle size={24} color="#15803d" />
            <strong style={{ display: 'block', fontSize: '26px', marginTop: '10px' }}>
              {t('projects:audit.current')}
            </strong>
            <span style={{ color: 'var(--on-surface-variant)' }}>
              {t('projects:audit.documentalStatus')}
            </span>
          </CardContent>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.9fr',
          gap: '28px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <Card>
            <CardHeader>
              <h2
                className="text-title-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ClipboardList size={20} />
                {t('projects:audit.documentsTitle')}
              </h2>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredDocuments.length === 0 ? (
                  <p style={{ color: 'var(--on-surface-variant)' }}>
                    {t('projects:audit.noDocumentsFound')}
                  </p>
                ) : (
                  pagedDocuments.map((document) => (
                    <div
                      key={document.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--surface-container-high)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileText size={22} color="var(--primary)" />
                        </div>

                        <div>
                          <strong style={{ display: 'block' }}>{document.name}</strong>
                          <span
                            className="text-caption"
                            style={{ color: 'var(--on-surface-variant)' }}
                          >
                            {document.id} · {document.type} · {document.owner} ·{' '}
                            {formatDate(document.date)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant={getDocumentVariant(document.status)}>
                          {document.status}
                        </Badge>

                        <Button
                          variant="secondary"
                          style={{ padding: '6px 10px' }}
                          icon={<Download size={16} />}
                          onClick={handleDownloadLog}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Pagination
                currentPage={docsPage}
                totalPages={docsTotalPages}
                totalItems={filteredDocuments.length}
                pageSize={PAGE_SIZE}
                onPageChange={setDocsPage}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2
                className="text-title-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Users size={20} />
                {t('projects:audit.participantsTitle')}
              </h2>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'grid', gap: '12px' }}>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 16px',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block' }}>{participant.name}</strong>
                      <span
                        className="text-caption"
                        style={{ color: 'var(--on-surface-variant)' }}
                      >
                        {participant.email}
                      </span>
                    </div>

                    <Badge variant="info">{participant.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <CardHeader
            style={{
              backgroundColor: '#111827',
              color: 'white',
            }}
          >
            <h2
              className="text-title-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShieldCheck size={20} />
              {t('projects:audit.auditTitle')}
            </h2>
          </CardHeader>

          <CardContent
            style={{
              backgroundColor: '#111827',
              color: '#e5e7eb',
              paddingTop: '24px',
              minHeight: '100%',
            }}
          >
            <div style={{ display: 'grid', gap: '18px' }}>
              {filteredEvents.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>
                  {t('projects:audit.noMovementsFound')}
                </p>
              ) : (
                pagedEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '999px',
                        marginTop: '4px',
                        backgroundColor:
                          event.status === 'success'
                            ? '#22c55e'
                            : event.status === 'warning'
                              ? '#f59e0b'
                              : '#60a5fa',
                      }}
                    />

                    <div
                      style={{
                        paddingBottom: '18px',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        <strong style={{ color: 'white' }}>{event.action}</strong>

                        <Badge variant={getAuditVariant(event.status)}>
                          {event.role}
                        </Badge>
                      </div>

                      <p
                        style={{
                          color: '#cbd5e1',
                          lineHeight: 1.5,
                          marginBottom: '8px',
                        }}
                      >
                        {event.detail}
                      </p>

                      <div
                        className="text-caption"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#9ca3af',
                        }}
                      >
                        <Clock size={14} />
                        {formatDate(event.date)} · {event.time} · {event.user}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
              }}
            >
              <Button
                variant="secondary"
                icon={<Download size={16} />}
                onClick={handleDownloadLog}
              >
                {t('projects:audit.downloadLog')}
              </Button>

              <Button
                variant="secondary"
                icon={<UploadCloud size={16} />}
                onClick={handleUpload}
              >
                {t('projects:audit.attachEvidence')}
              </Button>
            </div>
            <Pagination
              currentPage={eventsPage}
              totalPages={eventsTotalPages}
              totalItems={filteredEvents.length}
              pageSize={PAGE_SIZE}
              onPageChange={setEventsPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectAudit;