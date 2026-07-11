import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  FileText,
  HelpCircle,
  MapPin,
  RefreshCcw,
  Users,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';

function getStatusLabel(status?: string): string {
  if (!status) return 'Sin estado';

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
  };

  return dictionary[status.toUpperCase()] ?? status;
}

function getStatusProgress(status?: string): number {
  const normalized = String(status ?? '').toUpperCase();

  const progressByStatus: Record<string, number> = {
    POSTULATED: 15,
    POSTULADO: 15,
    OBSERVED: 25,
    OBSERVADO: 25,
    APPROVED: 45,
    APROBADO: 45,
    IN_PROGRESS: 65,
    EN_EJECUCION: 65,
    EN_EJECUCIÓN: 65,
    COMPLETED: 100,
    FINALIZADO: 100,
    REJECTED: 0,
    RECHAZADO: 0,
  };

  return progressByStatus[normalized] ?? 20;
}

function formatDate(value?: string): string {
  if (!value) return 'No registrado';

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

function formatMoney(value?: number): string {
  if (value === null || value === undefined) return 'No registrado';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function getDurationLabel(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return 'No registrada';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'No registrada';
  }

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months <= 0) return 'Menos de 1 mes';

  return `${months} mes${months === 1 ? '' : 'es'}`;
}

export const ProjectMonitoring: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => getStatusProgress(project?.status), [project?.status]);

  useEffect(() => {
    let mounted = true;


    async function loadProject() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await projectService.getById(id);

        if (mounted) {
          setProject(response);
        }
      } catch (err) {
        console.error('Error al cargar el proyecto:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el detalle del proyecto.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleMoveToExecution() {
    if (!id) return;

    try {
      setUpdatingStatus(true);
      const updatedProject = await projectService.updateStatus(id, 'IN_PROGRESS');
      setProject(updatedProject);
      toast.success('Estado actualizado correctamente.');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast.error('No se pudo actualizar el estado del proyecto.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Cargando detalle del proyecto...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
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
          <ArrowLeft size={16} /> Volver a proyectos
        </Link>

        <Alert title="No se pudo cargar el proyecto">
          El backend respondió: {error}. Verifica el endpoint GET /api/v1/projects/{id}.
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '32px', color: 'var(--on-surface-variant)' }}>
        Proyecto no encontrado.
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
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
        <ArrowLeft size={16} /> Volver a proyectos
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        <div>
          <Badge variant="info">{project.code || `PRY-${project.id}`}</Badge>

          <h1
            className="text-headline-lg"
            style={{
              marginTop: '12px',
              marginBottom: '8px',
              color: 'var(--primary)',
            }}
          >
            {project.title || 'Proyecto sin título'}
          </h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              maxWidth: '820px',
            }}
          >
            {project.summary || 'Este proyecto no tiene resumen registrado.'}
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={handleMoveToExecution}
          disabled={updatingStatus}
        >
          {updatingStatus ? 'Actualizando...' : 'Pasar a ejecución'}
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Estado
              </div>
              <Badge variant="neutral">{getStatusLabel(project.status)}</Badge>
            </div>

            <div>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Línea de investigación
              </div>
              <div className="text-body-md">
                {project.researchLineName || 'Sin línea registrada'}
              </div>
            </div>

            <div>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Grupo
              </div>
              <div className="text-body-md">
                {project.researchGroupCode || 'Sin grupo registrado'}
              </div>
            </div>

            <div>
              <div
                className="text-caption"
                style={{
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Presupuesto
              </div>
              <div className="text-body-md">{formatMoney(project.budget)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '32px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <h3 className="text-title-lg">Progreso general del proyecto</h3>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span className="text-label-md">
                  Estado actual: {getStatusLabel(project.status)}
                </span>
                <span className="text-label-md">{progress}%</span>
              </div>

              <div
                style={{
                  height: '10px',
                  backgroundColor: 'var(--surface-container-high)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
                {[
                  ['Postulación', 'POSTULATED'],
                  ['Observación', 'OBSERVED'],
                  ['Aprobación', 'APPROVED'],
                  ['Ejecución', 'IN_PROGRESS'],
                  ['Cierre', 'COMPLETED'],
                ].map(([label, status]) => (
                  <div
                    key={status}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid var(--outline-variant)',
                      backgroundColor: 'var(--surface-container-lowest)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                      {label}
                    </div>
                    <div
                      style={{
                        color: 'var(--on-surface-variant)',
                        fontSize: '12px',
                      }}
                    >
                      Estado referencial
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-title-lg">Objetivo general</h3>
            </CardHeader>

            <CardContent>
              <p
                className="text-body-md"
                style={{
                  color: 'var(--on-surface-variant)',
                  lineHeight: 1.7,
                }}
              >
                {project.generalObjective || 'No se registró el objetivo general del proyecto.'}
              </p>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3 className="text-title-lg">Informes Trimestrales y Final de Ejecución</h3>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <TableHeader>Periodo</TableHeader>
                    <TableHeader>Fecha Límite</TableHeader>
                    <TableHeader>Documento Subido</TableHeader>
                    <TableHeader>Estado</TableHeader>
                    <TableHeader>Observaciones</TableHeader>
                    <TableHeader style={{ textAlign: 'right' }}>Acción</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Trimestre 1</TableCell>
                    <TableCell>30/09/2026</TableCell>
                    <TableCell><span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>avance_t1.pdf</span></TableCell>
                    <TableCell><Badge variant="success">Aprobado</Badge></TableCell>
                    <TableCell>Conforme</TableCell>
                    <TableCell style={{ textAlign: 'right' }}><Button variant="secondary">Ver</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trimestre 2</TableCell>
                    <TableCell>31/12/2026</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell><Badge variant="warning">Pendiente</Badge></TableCell>
                    <TableCell style={{ color: 'var(--error)' }}>Faltan firmas del coinvestigador</TableCell>
                    <TableCell style={{ textAlign: 'right' }}><Button variant="primary">Subir Informe</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trimestre 3</TableCell>
                    <TableCell>31/03/2027</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell><Badge variant="neutral">Programado</Badge></TableCell>
                    <TableCell>—</TableCell>
                    <TableCell style={{ textAlign: 'right' }}><Button variant="secondary" disabled>Ver</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Informe Final</TableCell>
                    <TableCell>30/06/2027</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell><Badge variant="neutral" style={{ color: '#4527a0', backgroundColor: '#ede7f6' }}>Artículo Requerido</Badge></TableCell>
                    <TableCell>Debe adjuntar artículo o constancia de envío</TableCell>
                    <TableCell style={{ textAlign: 'right' }}><Button variant="secondary" disabled>Subir</Button></TableCell>
                  </TableRow>
                </TableBody>
              </TableContainer>
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
                <strong>Regla institucional:</strong> La omisión de informes trimestrales suspende el financiamiento FIF de forma automática.
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <h3 className="text-title-lg">Documentos del Expediente y Trazabilidad</h3>
            </CardHeader>
            <CardContent>
              <div className="section-grid-asymmetric" style={{ gap: '24px' }}>
                
                {/* Lista de Documentos */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Historial Documental</h4>
                  <TableContainer>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Archivo</TableHeader>
                        <TableHeader>Subido por</TableHeader>
                        <TableHeader>Fecha</TableHeader>
                        <TableHeader style={{ textAlign: 'right' }}>Descarga</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Proyecto_inicial.pdf</strong></TableCell>
                        <TableCell>Investigador</TableCell>
                        <TableCell>08/06/2026</TableCell>
                        <TableCell style={{ textAlign: 'right' }}><Button variant="secondary">Descargar</Button></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Resolución_R.D._045.pdf</strong></TableCell>
                        <TableCell>Decanato</TableCell>
                        <TableCell>20/06/2026</TableCell>
                        <TableCell style={{ textAlign: 'right' }}><Button variant="secondary">Descargar</Button></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Informe_T1.pdf</strong></TableCell>
                        <TableCell>Investigador</TableCell>
                        <TableCell>30/09/2026</TableCell>
                        <TableCell style={{ textAlign: 'right' }}><Button variant="secondary">Descargar</Button></TableCell>
                      </TableRow>
                    </TableBody>
                  </TableContainer>
                </div>

                {/* Trazabilidad lineal */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Trazabilidad de Firmas y Cambios</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--outline-variant)', paddingLeft: '16px', marginLeft: '6px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Postulación Enviada</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>08/06/2026 10:25 - Docente Investigador</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Aprobado por Coordinador</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>09/06/2026 15:40 - Coordinador de Grupo</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Aprobado por Dirección</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>12/06/2026 11:10 - Director de Investigación</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                      <strong style={{ fontSize: '13px' }}>Resolución Emitida</strong>
                      <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>20/06/2026 09:30 - Decanato (Firma RD-045)</div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <h3 className="text-title-lg">Detalles administrativos</h3>
            </CardHeader>

            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CalendarDays size={20} color="var(--primary)" />
                  <div>
                    <strong>Fechas</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <ClipboardCheck size={20} color="var(--primary)" />
                  <div>
                    <strong>Duración</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {getDurationLabel(project.startDate, project.endDate)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <div>
                    <strong>Lugar de ejecución</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.executionPlace || 'No registrado'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <DollarSign size={20} color="var(--primary)" />
                  <div>
                    <strong>Presupuesto</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {formatMoney(project.budget)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Users size={20} color="var(--primary)" />
                  <div>
                    <strong>Responsable</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      ID de usuario: {project.responsibleId ?? 'No registrado'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <strong>Documento asociado</strong>
                    <div style={{ color: 'var(--on-surface-variant)' }}>
                      {project.documentId ? `Documento #${project.documentId}` : 'No registrado'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <HelpCircle size={24} />
              <h3 className="text-title-lg">¿Necesitas ayuda?</h3>
            </div>

            <p
              className="text-body-md"
              style={{ marginBottom: '24px', opacity: 0.9 }}
            >
              Si tienes problemas con la revisión, trazabilidad o documentación del proyecto,
              contacta a la oficina de investigación.
            </p>

            <Link
              to="/progressreports/review"
              style={{
                color: 'white',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Ir a revisión de informes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMonitoring;