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
  };

  return dictionary[normalized] ?? status;
}

function isStatus(project: Project, values: string[]): boolean {
  const status = normalizeText(project.status);
  return values.some((value) => status === normalizeText(value));
}

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await projectService.getAll();

        if (mounted) {
          setProjects(normalizeProjects(response as ProjectResponse));
        }
      } catch (err) {
        console.error('Error al cargar proyectos:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar los proyectos.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();

    projects.forEach((project) => {
      if (project.status) {
        statuses.add(project.status);
      }
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

      const matchesStatus =
        statusFilter === 'TODOS' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const postulatedProjects = projects.filter((project) =>
    isStatus(project, ['POSTULATED', 'POSTULADO'])
  ).length;

  const inProgressProjects = projects.filter((project) =>
    isStatus(project, ['IN_PROGRESS', 'EN_EJECUCION', 'EN_EJECUCIÓN'])
  ).length;

  const observedProjects = projects.filter((project) =>
    isStatus(project, ['OBSERVED', 'OBSERVADO', 'REJECTED', 'RECHAZADO'])
  ).length;

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
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
          <h1 className="text-headline-lg">Proyectos y tesis</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            Gestiona, consulta y da seguimiento a los proyectos y propuestas académicas de investigación.
          </p>
        </div>

        <Link to="/projects/new">
          <Button icon={<Plus size={18} />}>Nueva propuesta</Button>
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FolderOpen size={24} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {projects.length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Total registrados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={24} color="#f59e0b" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {postulatedProjects}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Postulados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={24} color="#15803d" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {inProgressProjects}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  En ejecución
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#ba1a1a" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {observedProjects}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Observados o rechazados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 240px',
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
          </div>

          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: '#ffdad6',
                color: '#8c1d18',
                border: '1px solid rgba(186, 26, 26, 0.25)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px' }}>
                No se pudieron cargar los proyectos
              </strong>
              <span>
                El backend respondió: {error}. Verifica el endpoint GET /api/v1/projects.
              </span>
            </div>
          )}

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
              {loading ? (
                <TableRow>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    Cargando proyectos...
                  </td>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    No se puede mostrar el listado mientras el backend devuelva error.
                  </td>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
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
                      <div style={{ fontWeight: 600 }}>
                        {item.title || 'Sin título'}
                      </div>

                      {item.summary && (
                        <div
                          style={{
                            marginTop: '4px',
                            color: 'var(--on-surface-variant)',
                            fontSize: '12px',
                            maxWidth: '420px',
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
                      <Badge variant="info">
                        {item.researchGroupCode || 'Sin grupo'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.researchLineName || 'Sin línea asignada'}
                    </TableCell>

                    <TableCell>
                      <Badge variant="neutral">
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>

                    <TableCell style={{ textAlign: 'right' }}>
                      <Link to={`/projects/${item.id}`}>
                        <Button
                          variant="secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          Ver detalle
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsList;