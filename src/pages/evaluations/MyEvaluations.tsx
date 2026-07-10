import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  FileCheck,
  RefreshCcw,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

import { AuthContext } from '../../context/AuthContext';
import {
  evaluacionService,
  type EvaluationItem,
} from '../../services/evaluacionService';

type EvaluationResponse =
  | EvaluationItem[]
  | {
      content?: EvaluationItem[];
      data?: EvaluationItem[];
      items?: EvaluationItem[];
    };

function normalizeEvaluations(response: EvaluationResponse): EvaluationItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.content)) return response.content;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;

  return [];
}

function readValue(
  item: EvaluationItem,
  keys: string[],
  fallback = 'No registrado'
): string {
  const record = item as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value);
    }
  }

  return fallback;
}

function readId(item: EvaluationItem): string | number {
  return (
    item.id ??
    item.evaluationId ??
    item.idEvaluacion ??
    item.projectId ??
    item.idProyecto ??
    'SIN-ID'
  );
}

function getTypeLabel(item: EvaluationItem): string {
  const type = readValue(item, ['type', 'tipo'], 'Evaluación').toUpperCase();

  const dictionary: Record<string, string> = {
    PROJECT: 'Proyecto',
    PROYECTO: 'Proyecto',
    THESIS: 'Tesis',
    TESIS: 'Tesis',
    PLAN_TESIS: 'Plan de tesis',
    INFORME: 'Informe',
  };

  return dictionary[type] ?? readValue(item, ['type', 'tipo'], 'Evaluación');
}

function getTitle(item: EvaluationItem): string {
  return readValue(
    item,
    ['title', 'titulo', 'projectTitle', 'thesisTitle'],
    'Documento sin título'
  );
}

function getStatus(item: EvaluationItem): string {
  return readValue(item, ['status', 'estado', 'result', 'resultado'], 'Pendiente');
}

function getStatusLabel(status?: string): string {
  if (!status) return 'Pendiente';

  const normalized = status.toUpperCase();

  const dictionary: Record<string, string> = {
    PENDING: 'Pendiente',
    PENDIENTE: 'Pendiente',
    ASSIGNED: 'Asignado',
    ASIGNADO: 'Asignado',
    IN_PROGRESS: 'En progreso',
    EN_PROGRESO: 'En progreso',
    EN_REVISION: 'En revisión',
    EN_REVISIÓN: 'En revisión',
    COMPLETED: 'Completado',
    COMPLETADO: 'Completado',
    APPROVED: 'Aprobado',
    APROBADO: 'Aprobado',
    REJECTED: 'Rechazado',
    RECHAZADO: 'Rechazado',
    OBSERVED: 'Observado',
    OBSERVADO: 'Observado',
    CON_OBSERVACIONES: 'Con observaciones',
  };

  return dictionary[normalized] ?? status;
}

function isPendingStatus(status?: string): boolean {
  const normalized = String(status ?? '').toUpperCase();

  return [
    'PENDING',
    'PENDIENTE',
    'ASSIGNED',
    'ASIGNADO',
    'IN_PROGRESS',
    'EN_PROGRESO',
    'EN_REVISION',
    'EN_REVISIÓN',
  ].includes(normalized);
}

function isCompletedStatus(status?: string): boolean {
  const normalized = String(status ?? '').toUpperCase();

  return [
    'COMPLETED',
    'COMPLETADO',
    'APPROVED',
    'APROBADO',
    'REJECTED',
    'RECHAZADO',
    'OBSERVED',
    'OBSERVADO',
    'CON_OBSERVACIONES',
  ].includes(normalized);
}

function getBadgeVariant(status?: string): 'warning' | 'info' | 'success' | 'neutral' {
  const normalized = String(status ?? '').toUpperCase();

  if (['PENDING', 'PENDIENTE', 'ASSIGNED', 'ASIGNADO'].includes(normalized)) {
    return 'warning';
  }

  if (['IN_PROGRESS', 'EN_PROGRESO', 'EN_REVISION', 'EN_REVISIÓN'].includes(normalized)) {
    return 'info';
  }

  if (['COMPLETED', 'COMPLETADO', 'APPROVED', 'APROBADO'].includes(normalized)) {
    return 'success';
  }

  return 'neutral';
}

function formatDate(value?: string): string {
  if (!value || value === 'No registrado') return 'No registrado';

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

function getEvaluatorId(user: unknown): string | number | null {
  const record = user as Record<string, unknown> | null;

  return (
    (record?.id as string | number | undefined) ??
    (record?.userId as string | number | undefined) ??
    (record?.idUsuario as string | number | undefined) ??
    null
  );
}

export const MyEvaluations: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentRole } = useContext(AuthContext);

  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const evaluatorId = useMemo(() => getEvaluatorId(user), [user]);
  const isEvaluatorRole = currentRole === 'EVALUADOR';

  async function loadEvaluations() {
    try {
      setLoading(true);
      setError(null);

      if (!isEvaluatorRole) {
        setEvaluations([]);
        return;
      }

      if (!evaluatorId) {
        setEvaluations([]);
        setError(null);
        return;
      }

      const response = await evaluacionService.getByEvaluator(evaluatorId);

      setEvaluations(normalizeEvaluations(response as EvaluationResponse));
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las evaluaciones.'
      );

      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluatorId, currentRole]);

  const pendingCount = evaluations.filter((item) =>
    isPendingStatus(getStatus(item))
  ).length;

  const completedCount = evaluations.filter((item) =>
    isCompletedStatus(getStatus(item))
  ).length;

  const totalCount = evaluations.length;

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
          <h1 className="text-headline-lg">Mis evaluaciones</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
              maxWidth: '760px',
            }}
          >
            Consulta los proyectos, tesis o documentos asignados para revisión,
            evaluación y emisión de dictamen académico.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<RefreshCcw size={16} />}
          onClick={loadEvaluations}
          disabled={loading || !isEvaluatorRole}
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileCheck size={24} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '28px' }}>
                  {totalCount}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Total asignadas
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
                <strong style={{ display: 'block', fontSize: '28px' }}>
                  {pendingCount}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Pendientes
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
                <strong style={{ display: 'block', fontSize: '28px' }}>
                  {completedCount}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>
                  Atendidas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isEvaluatorRole && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Vista disponible para evaluadores">
            La sesión actual corresponde al rol {currentRole || 'Usuario'}. Esta pantalla se
            mostrará con datos reales cuando ingreses con una cuenta que tenga el rol EVALUADOR.
          </Alert>
        </div>
      )}

            {isEvaluatorRole && !evaluatorId && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Evaluador sin identificador en sesión">
            Tu sesión tiene rol EVALUADOR, pero el perfil recibido no incluye el ID interno
            necesario para consultar evaluaciones asignadas. La pantalla queda lista y no se
            consultará el backend hasta que el perfil incluya ese dato.
          </Alert>
        </div>
      )}

      {isEvaluatorRole && evaluatorId && error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="No se pudieron cargar las evaluaciones">
            El backend respondió: {error}. Verifica el endpoint
            GET /api/v1/evaluaciones/evaluador/{evaluatorId}.
          </Alert>
        </div>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Documento</TableHeader>
                <TableHeader>Fecha de asignación</TableHeader>
                <TableHeader>Fecha límite</TableHeader>
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
                    Cargando evaluaciones...
                  </td>
                </TableRow>
              ) : !isEvaluatorRole ? (
                <TableRow>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    No hay evaluaciones para mostrar con el rol actual.
                  </td>
                </TableRow>
              ) : evaluations.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    No tienes evaluaciones asignadas por el momento.
                  </td>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => {
                  const id = readId(evaluation);
                  const status = getStatus(evaluation);
                  const title = getTitle(evaluation);
                  const type = getTypeLabel(evaluation);

                  const assignedDate = readValue(
                    evaluation,
                    ['dateAssigned', 'fechaAsignacion', 'assignedAt'],
                    'No registrado'
                  );

                  const deadline = readValue(
                    evaluation,
                    ['deadline', 'fechaLimite', 'dueDate'],
                    'No registrado'
                  );

                  return (
                    <TableRow key={String(id)}>
                      <TableCell>
                        <Badge variant={type === 'Tesis' ? 'info' : 'neutral'}>
                          {type}
                        </Badge>
                      </TableCell>

                      <TableCell style={{ fontWeight: 600, maxWidth: '360px' }}>
                        <div>{title}</div>

                        <div
                          className="text-caption"
                          style={{
                            color: 'var(--on-surface-variant)',
                            marginTop: '4px',
                          }}
                        >
                          Evaluación #{id}
                        </div>
                      </TableCell>

                      <TableCell>{formatDate(assignedDate)}</TableCell>

                      <TableCell>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color:
                              deadline !== 'No registrado'
                                ? 'var(--error)'
                                : 'var(--on-surface-variant)',
                            fontWeight: 600,
                          }}
                        >
                          <Calendar size={16} />
                          {formatDate(deadline)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getBadgeVariant(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>

                      <TableCell style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                          }}
                        >
                          <Button
                            variant="secondary"
                            style={{ padding: '4px 12px' }}
                            icon={<Eye size={16} />}
                            onClick={() => navigate(`/projects/evaluate?evaluationId=${id}`)}
                          >
                            Ver
                          </Button>

                          <Button
                            variant="primary"
                            style={{ padding: '4px 12px' }}
                            icon={<Edit3 size={16} />}
                            onClick={() => navigate(`/projects/evaluate?evaluationId=${id}`)}
                          >
                            Evaluar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyEvaluations;