import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  return String(value ?? '').toLowerCase().trim();
}

function getStatusLabel(status: string | undefined): string {
  if (!status) return 'Sin estado';
  const normalized = status.toUpperCase();
  const dictionary: Record<string, string> = {
    POSTULATED: 'Postulado',
    POSTULADO: 'Postulado',
    OBSERVED: 'Observado',
    OBSERVADO: 'Observado',
    APPROVED: 'Aprobado',
    APROBADO: 'Aprobado',
    REJECTED: 'Rechazado',
    RECHAZADO: 'Rechazado',
    IN_PROGRESS: 'En ejecución',
    EN_EJECUCION: 'En ejecución',
    EN_EJECUCIÓN: 'En ejecución',
    COMPLETED: 'Finalizado',
    FINALIZADO: 'Finalizado',
    ACTIVE: 'Activo',
    ACTIVO: 'Activo',
    PENDING: 'Pendiente',
    PENDIENTE: 'Pendiente',
    UNDER_REVIEW: 'En revisión',
    EN_REVISION: 'En revisión',
    EN_REVISIÓN: 'En revisión',
    DRAFT: 'Borrador',
    BORRADOR: 'Borrador',
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

export const ProjectsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'drafts'>('proposals');

  const [projects, setProjects] = useState<Project[]>([]);
  const [drafts, setDrafts] = useState<Project[]>([]);

  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

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
        setError('No fue posible cargar las propuestas. Inténtelo nuevamente.');
      } else {
        setError(errorMsg || 'Ocurrió un problema al obtener la información.');
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
      setError('No fue posible cargar los borradores. Inténtelo nuevamente.');
    } finally {
      setLoadingDrafts(false);
    }
  }

  async function handleDeleteDraft(id: string | number) {
    if (!window.confirm('¿Estás seguro de eliminar este borrador?')) return;
    try {
      await projectService.deleteDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('No se pudo eliminar el borrador.');
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
  }, [projects, searchTerm, statusFilter]);

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

  const postulatedCount = projects.filter((p) => isStatus(p, ['POSTULATED', 'POSTULADO'])).length;
  const inProgressCount = projects.filter((p) => isStatus(p, ['IN_PROGRESS', 'EN_EJECUCION', 'EN_EJECUCIÓN', 'ACTIVE', 'ACTIVO'])).length;
  const observedCount = projects.filter((p) => isStatus(p, ['OBSERVED', 'OBSERVADO', 'REJECTED', 'RECHAZADO'])).length;

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
          <h1 className="text-headline-lg">Proyectos y tesis</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            Gestiona, consulta y da seguimiento a los proyectos y propuestas académicas de investigación.
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
            {loadingProposals || loadingDrafts ? 'Actualizando...' : 'Actualizar'}
          </Button>

          <Link to="/projects/new">
            <Button icon={<Plus size={18} />}>Nueva propuesta</Button>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Total registrados</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Postulados</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>En ejecución</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Observados o rechazados</span>
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
                <span style={{ color: 'var(--on-surface-variant)' }}>Borradores</span>
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
            Propuestas
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
            Borradores
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
                placeholder="Buscar por código, título, grupo o línea..."
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
                  <option value="TODOS">Todos los estados</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeTab === 'proposals' ? (
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>Código</TableHeader>
                  <TableHeader>Proyecto</TableHeader>
                  <TableHeader>Grupo</TableHeader>
                  <TableHeader>Línea de investigación</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {error ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--error)' }}>
                      {error}
                    </td>
                  </TableRow>
                ) : loadingProposals ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
                      Cargando proyectos...
                    </td>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
                      No se encontraron proyectos con los filtros aplicados.
                    </td>
                  </TableRow>
                ) : (
                  filteredProjects.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ fontWeight: 700 }}>
                        {item.code || `PRY-${item.id}`}
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{item.title || 'Sin título'}</div>
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
                        <Badge variant="info">{item.researchGroupCode || 'Sin grupo'}</Badge>
                      </TableCell>
                      <TableCell>{item.researchLineName || 'Sin línea asignada'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link to={`/projects/${item.id}`}>
                            <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                              Ver detalle
                            </Button>
                          </Link>
                          <Link to={`/projects/assign?projectId=${item.id}`}>
                            <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                              Revisores
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableContainer>
          ) : (
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>Código</TableHeader>
                  <TableHeader>Proyecto</TableHeader>
                  <TableHeader>Grupo</TableHeader>
                  <TableHeader>Línea de investigación</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {error && !loadingDrafts ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--error)' }}>
                      {error}
                    </td>
                  </TableRow>
                ) : loadingDrafts ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
                      Cargando borradores...
                    </td>
                  </TableRow>
                ) : filteredDrafts.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>
                      No tienes borradores guardados.
                    </td>
                  </TableRow>
                ) : (
                  filteredDrafts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell style={{ fontWeight: 700 }}>
                        {item.code || `BOR-${item.id}`}
                      </TableCell>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{item.title || 'Sin título'}</div>
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
                        <Badge variant="info">{item.researchGroupCode || 'Sin grupo'}</Badge>
                      </TableCell>
                      <TableCell>{item.researchLineName || 'Sin línea asignada'}</TableCell>
                      <TableCell>
                        <Badge variant="neutral">Borrador</Badge>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link to={`/projects/new?editDraft=${item.id}`}>
                            <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                              Editar
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
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsList;
