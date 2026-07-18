import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCcw,
  FileText,
  Trash2,
} from 'lucide-react';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';

import Pagination from '../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';

type ProjectResponse = Project[] | { content?: Project[]; data?: Project[]; items?: Project[] };

function normalizeProjects(response: ProjectResponse): Project[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.content)) return response.content;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

function normalizeText(value: unknown): string {
  if (value !== null && value !== undefined && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
    return String(value).toLowerCase().trim();
  }
  return '';
}

function getStatusLabel(status: string | undefined, t: (key: string) => string): string {
  if (!status) return t('projects:statuses.noStatus');
  const normalized = status.toUpperCase();
  const dictionary: Record<string, string> = {
    POSTULATED: t('projects:statuses.postulado'),
    POSTULADO: t('projects:statuses.postulado'),
    OBSERVED: t('projects:statuses.observado'),
    OBSERVADO: t('projects:statuses.observado'),
    APPROVED: t('projects:statuses.aprobado'),
    APROBADO: t('projects:statuses.aprobado'),
    REJECTED: t('projects:statuses.rechazado'),
    RECHAZADO: t('projects:statuses.rechazado'),
    IN_PROGRESS: t('projects:statuses.enEjecucion'),
    EN_EJECUCION: t('projects:statuses.enEjecucion'),
    EN_EJECUCIÓN: t('projects:statuses.enEjecucion'),
    COMPLETED: t('projects:statuses.finalizado'),
    FINALIZADO: t('projects:statuses.finalizado'),
    ACTIVE: t('projects:statuses.activo'),
    ACTIVO: t('projects:statuses.activo'),
    PENDING: t('projects:statuses.pendiente'),
    PENDIENTE: t('projects:statuses.pendiente'),
    UNDER_REVIEW: t('projects:statuses.enRevision'),
    EN_REVISION: t('projects:statuses.enRevision'),
    EN_REVISIÓN: t('projects:statuses.enRevision'),
    DRAFT: t('projects:statuses.borrador'),
    BORRADOR: t('projects:statuses.borrador'),
  };
  return dictionary[normalized] ?? status;
}

function getStatusVariant(status: string | undefined): 'neutral' | 'info' | 'warning' | 'success' | 'error' {
  const normalized = String(status ?? '').toUpperCase();

  if (['POSTULATED', 'POSTULADO', 'PENDING', 'PENDIENTE', 'UNDER_REVIEW', 'EN_REVISION'].includes(normalized)) {
    return 'warning';
  }
  if (['IN_PROGRESS', 'EN_EJECUCION', 'EN_EJECUCIÓN', 'ACTIVE', 'ACTIVO'].includes(normalized)) {
    return 'info';
  }
  if (['APPROVED', 'APROBADO', 'COMPLETED', 'FINALIZADO'].includes(normalized)) {
    return 'success';
  }
  if (['OBSERVED', 'OBSERVADO', 'REJECTED', 'RECHAZADO'].includes(normalized)) {
    return 'error';
  }
  if (['DRAFT', 'BORRADOR'].includes(normalized)) {
    return 'neutral';
  }
  return 'neutral';
}

function isStatus(project: Project, values: string[]): boolean {
  const status = normalizeText(project.status);
  return values.some((value) => status === normalizeText(value));
}

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  border: 'none',
  borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
  background: 'transparent',
  color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
  fontWeight: active ? 600 : 400,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const PAGE_SIZE = 10;

export const ProjectsList: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation('projects');
  const [activeTab, setActiveTab] = useState<'proposals' | 'drafts'>('proposals');

  const [projects, setProjects] = useState<Project[]>([]);
  const [drafts, setDrafts] = useState<Project[]>([]);

  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [pageProposals, setPageProposals] = useState(1);
  const [pageDrafts, setPageDrafts] = useState(1);

  async function loadProposals() {
    try {
      setLoadingProposals(true);
      setError(null);
      const response = await projectService.getAll();
      setProjects(normalizeProjects(response as ProjectResponse));
    } catch (err: any) {
      console.error('Error al cargar proyectos:', err);
      const errorMsg = err.message || '';
      if (errorMsg.includes('500') || errorMsg.includes('NullPointer')) {
        setError(t('projects:list.errorLoadingProposals500'));
      } else {
        setError(errorMsg || t('projects:list.errorLoadingProposalsGeneric'));
      }
    } finally {
      setLoadingProposals(false);
    }
  }

  async function loadDrafts() {
    try {
      setLoadingDrafts(true);
      setError(null);
      const response = await projectService.getMyDrafts();
      setDrafts(normalizeProjects(response as ProjectResponse));
    } catch (err: any) {
      console.error('Error al cargar borradores:', err);
      setError(t('projects:list.errorLoadingDrafts'));
    } finally {
      setLoadingDrafts(false);
    }
  }

  async function handleDeleteDraft(id: string | number) {
    if (!window.confirm(t('projects:list.deleteDraftConfirm'))) return;
    try {
      await projectService.deleteDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError(t('projects:list.deleteDraftError'));
    }
  }

  useEffect(() => {
    loadProposals();
    loadDrafts();
  }, []);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    projects.forEach((project) => {
      if (project.status) statuses.add(project.status);
    });
    return Array.from(statuses);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const search = normalizeText(searchTerm);
    return projects.filter((project) => {
      // Drafts should only be visible to the user who created them
      const isDraft = ['DRAFT', 'BORRADOR'].includes(String(project.status).toUpperCase());
      if (isDraft && String(project.responsibleId) !== String(user?.id)) {
        return false;
      }

      const matchesSearch =
        !search ||
        normalizeText(project.id).includes(search) ||
        normalizeText(project.code).includes(search) ||
        normalizeText(project.title).includes(search) ||
        normalizeText(project.summary).includes(search) ||
        normalizeText(project.researchLineName).includes(search) ||
        normalizeText(project.researchGroupCode).includes(search) ||
        normalizeText(project.status).includes(search);
      const matchesStatus = statusFilter === 'TODOS' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter, user]);

  const totalProposalsPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const paginatedProjects = filteredProjects.slice(
    (pageProposals - 1) * PAGE_SIZE,
    pageProposals * PAGE_SIZE
  );

  const filteredDrafts = useMemo(() => {
    const search = normalizeText(searchTerm);
    return drafts.filter((draft) => {
      return (
        !search ||
        normalizeText(draft.id).includes(search) ||
        normalizeText(draft.code).includes(search) ||
        normalizeText(draft.title).includes(search) ||
        normalizeText(draft.summary).includes(search)
      );
    });
  }, [drafts, searchTerm]);

  const totalDraftsPages = Math.ceil(filteredDrafts.length / PAGE_SIZE);
  const paginatedDrafts = filteredDrafts.slice(
    (pageDrafts - 1) * PAGE_SIZE,
    pageDrafts * PAGE_SIZE
  );

  React.useEffect(() => {
    setPageProposals(1);
  }, [searchTerm, statusFilter]);

  React.useEffect(() => {
    setPageDrafts(1);
  }, [searchTerm]);

  const postulatedCount = projects.filter((p) => isStatus(p, ['POSTULATED', 'POSTULADO'])).length;
  const inProgressCount = projects.filter((p) => isStatus(p, ['IN_PROGRESS', 'EN_EJECUCION', 'EN_EJECUCIÓN', 'ACTIVE', 'ACTIVO'])).length;
  const observedCount = projects.filter((p) => isStatus(p, ['OBSERVED', 'OBSERVADO', 'REJECTED', 'RECHAZADO'])).length;

  const renderProposalsTableBody = () => {
    if (error) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--error)' }}>
            {error}
          </td>
        </TableRow>
      );
    }
    if (loadingProposals) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
            {t('projects:list.loadingProjects')}
          </td>
        </TableRow>
      );
    }
    if (filteredProjects.length === 0) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
            {t('projects:list.noResults')}
          </td>
        </TableRow>
      );
    }
    return paginatedProjects.map((item) => (
      <TableRow key={item.id}>
        <TableCell style={{ fontWeight: 700 }}>
          {item.code || `PRY-${item.id}`}
        </TableCell>
        <TableCell>
          <div style={{ fontWeight: 600 }}>{item.title || t('projects:list.noTitle')}</div>
          {item.summary && (
            <div
              style={{
                marginTop: '4px',
                color: 'var(--on-surface-variant)',
                fontSize: '12px',
                maxWidth: '600px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.summary}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="info">{item.researchGroupCode || t('projects:list.noGroup')}</Badge>
        </TableCell>
        <TableCell>{item.researchLineName || t('projects:list.noLine')}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(item.status)}>
            {getStatusLabel(item.status, t)}
          </Badge>
        </TableCell>
        <TableCell style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Link to={`/projects/${item.id}`}>
              <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                {t('projects:list.viewDetail')}
              </Button>
            </Link>
            <Link to={`/projects/assign?projectId=${item.id}`}>
              <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                {t('projects:list.reviewers')}
              </Button>
            </Link>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  const renderDraftsTableBody = () => {
    if (error && !loadingDrafts) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--error)' }}>
            {error}
          </td>
        </TableRow>
      );
    }
    if (loadingDrafts) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
            {t('projects:list.loadingDrafts')}
          </td>
        </TableRow>
      );
    }
    if (filteredDrafts.length === 0) {
      return (
        <TableRow>
          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
            {t('projects:list.noDrafts')}
          </td>
        </TableRow>
      );
    }
    return paginatedDrafts.map((item) => (
      <TableRow key={item.id}>
        <TableCell style={{ fontWeight: 700 }}>
          {item.code || `BOR-${item.id}`}
        </TableCell>
        <TableCell>
          <div style={{ fontWeight: 600 }}>{item.title || t('projects:list.noTitle')}</div>
          {item.summary && (
            <div
              style={{
                marginTop: '4px',
                color: 'var(--on-surface-variant)',
                fontSize: '12px',
                maxWidth: '600px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.summary}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="info">{item.researchGroupCode || t('projects:list.noGroup')}</Badge>
        </TableCell>
        <TableCell>{item.researchLineName || t('projects:list.noLine')}</TableCell>
        <TableCell>
          <Badge variant="neutral">{t('projects:list.editDraft')}</Badge>
        </TableCell>
        <TableCell style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Link to={`/projects/new?editDraft=${item.id}`}>
              <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                {t('projects:list.editDraft')}
              </Button>
            </Link>
            <Button
              variant="secondary"
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                color: 'var(--error)',
              }}
              icon={<Trash2 size={14} />}
              onClick={() => handleDeleteDraft(item.id)}
            >
              {t('projects:list.deleteDraft')}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 className="text-headline-lg">{t('projects:list.pageTitle')}</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {t('projects:list.pageSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCcw size={16} />}
            onClick={() => {
              loadProposals();
              loadDrafts();
            }}
            disabled={loadingProposals || loadingDrafts}
          >
            {loadingProposals || loadingDrafts ? t('projects:list.updating') : t('projects:list.refresh')}
          </Button>

          <Link to="/projects/new">
            <Button icon={<Plus size={18} />}>{t('projects:list.newProposal')}</Button>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FolderOpen size={24} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>{projects.length}</strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:list.totalRegistered')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={24} color="#f59e0b" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>{postulatedCount}</strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:list.postulated')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={24} color="#15803d" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>{inProgressCount}</strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:list.inExecution')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#ba1a1a" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>{observedCount}</strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:list.observedOrRejected')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color="#6366f1" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>{drafts.length}</strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('projects:list.draftsCount')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--outline-variant, #e0e0e0)',
          }}
        >
          <button
            style={tabButtonStyle(activeTab === 'proposals')}
            onClick={() => {
              setActiveTab('proposals');
              setSearchTerm('');
              setStatusFilter('TODOS');
            }}
          >
            <FolderOpen size={16} />
            {t('projects:list.proposals')}
            <Badge variant="info" style={{ marginLeft: '4px' }}>{projects.length}</Badge>
          </button>

          <button
            style={tabButtonStyle(activeTab === 'drafts')}
            onClick={() => {
              setActiveTab('drafts');
              setSearchTerm('');
            }}
          >
            <FileText size={16} />
            {t('projects:list.draftsCount')}
            <Badge variant="neutral" style={{ marginLeft: '4px' }}>{drafts.length}</Badge>
          </button>
        </div>

        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: activeTab === 'proposals' ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '11px',
                  color: 'var(--on-surface-variant)',
                }}
              />
              <input
                type="text"
                placeholder={t('projects:list.searchPlaceholder')}
                className="input"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {activeTab === 'proposals' && (
              <div style={{ position: 'relative' }}>
                <Filter
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '11px',
                    color: 'var(--on-surface-variant)',
                  }}
                />
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ paddingLeft: '36px' }}
                >
                  <option value="TODOS">{t('projects:list.allStatuses')}</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status, t)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeTab === 'proposals' ? (
            <>
              <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>{t('projects:list.columns.code')}</TableHeader>
                  <TableHeader>{t('projects:list.project')}</TableHeader>
                  <TableHeader>{t('projects:list.columns.group')}</TableHeader>
                  <TableHeader>{t('projects:list.researchLine')}</TableHeader>
                  <TableHeader>{t('projects:list.columns.status')}</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>{t('projects:list.columns.actions')}</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {renderProposalsTableBody()}
              </TableBody>
            </TableContainer>
            <Pagination
              currentPage={pageProposals}
              totalPages={totalProposalsPages}
              totalItems={filteredProjects.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPageProposals}
            />
            </>
          ) : (
            <>
              <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>{t('projects:list.columns.code')}</TableHeader>
                  <TableHeader>{t('projects:list.project')}</TableHeader>
                  <TableHeader>{t('projects:list.columns.group')}</TableHeader>
                  <TableHeader>{t('projects:list.researchLine')}</TableHeader>
                  <TableHeader>{t('projects:list.columns.status')}</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>{t('projects:list.columns.actions')}</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {renderDraftsTableBody()}
              </TableBody>
            </TableContainer>
            <Pagination
              currentPage={pageDrafts}
              totalPages={totalDraftsPages}
              totalItems={filteredDrafts.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPageDrafts}
            />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsList;
