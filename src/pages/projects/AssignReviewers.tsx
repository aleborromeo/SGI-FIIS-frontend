import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Trash2,
  UserPlus,
  Users,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { evaluacionService } from '../../services/evaluacionService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

interface Reviewer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

const initialReviewers: Reviewer[] = [
  {
    id: 1,
    firstName: 'Jorge',
    lastName: 'Castro',
    email: 'jorge.castro@unas.edu.pe',
    role: 'Evaluador',
    department: 'Ingeniería de Software',
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'Rojas',
    email: 'maria.rojas@unas.edu.pe',
    role: 'Docente investigador',
    department: 'Inteligencia Artificial',
  },
  {
    id: 3,
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza@unas.edu.pe',
    role: 'Evaluador',
    department: 'Sistemas de Información',
  },
  {
    id: 4,
    firstName: 'Ana',
    lastName: 'Gómez',
    email: 'ana.gomez@unas.edu.pe',
    role: 'Coordinadora de grupo',
    department: 'Seguridad de la Información',
  },
];

function getFullName(reviewer: Reviewer): string {
  return `${reviewer.firstName} ${reviewer.lastName}`.trim();
}

export const AssignReviewers: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const projectId = queryParams.get('projectId') || '1';
  const navigate = useNavigate();

  const [availableReviewers] = useState<Reviewer[]>(initialReviewers);
  const [assignedReviewers, setAssignedReviewers] = useState<Reviewer[]>([]);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading] = useState(false);

  const filteredReviewers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return availableReviewers;

    return availableReviewers.filter((reviewer) => {
      const fullName = getFullName(reviewer).toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        reviewer.email.toLowerCase().includes(normalizedSearch) ||
        reviewer.department.toLowerCase().includes(normalizedSearch) ||
        reviewer.role.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [availableReviewers, search]);

  function handleAssign(reviewer: Reviewer) {
    const alreadyAssigned = assignedReviewers.some(
      (item) => item.id === reviewer.id
    );

    if (alreadyAssigned) return;

    setAssignedReviewers((current) => [...current, reviewer]);
    setErrorMsg('');
    setMessage(null);
  }

  function handleRemove(userId: number) {
    setAssignedReviewers((current) =>
      current.filter((reviewer) => reviewer.id !== userId)
    );

    setMessage(null);
  }

  async function handleConfirm() {
    if (assignedReviewers.length === 0) {
      toast.warning('Debe asignar al menos un jurado.');
      return;
    }
    
    try {
      const reviewerIds = assignedReviewers.map(r => r.id);
      await evaluacionService.assignReviewers(Number(projectId), reviewerIds);
      toast.success('Jurados asignados exitosamente');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al asignar jurados');
    }
  }



  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '64px',
        maxWidth: '1080px',
        margin: '0 auto',
      }}
    >
      <Link
        to={`/projects/${projectId}`}
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
        Volver al proyecto
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
          <h1 className="text-headline-lg">Asignación de jurados y revisores</h1>

          <p
            className="text-body-md"
            style={{
              color: 'var(--on-surface-variant)',
              marginTop: '8px',
            }}
          >
            Proyecto: <strong>FIIS-2026-{String(projectId).padStart(3, '0')}</strong>
          </p>
        </div>

        <Badge variant="info">
          {assignedReviewers.length} seleccionado(s)
        </Badge>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Revisa la asignación">{errorMsg}</Alert>
        </div>
      )}

      {message && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title="Asignación registrada en la vista">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          </Alert>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
        }}
      >
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-title-lg">Buscar docentes disponibles</h2>
            </CardHeader>

            <CardContent>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Buscar por nombre, correo, rol o área..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <Button variant="secondary" icon={<Search size={18} />}>
                  Buscar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
                    Cargando docentes...
                  </div>
                ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {filteredReviewers.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    No se encontraron docentes con ese criterio de búsqueda.
                  </div>
                ) : (
                  filteredReviewers.map((reviewer) => {
                    const assigned = assignedReviewers.some(
                      (item) => item.id === reviewer.id
                    );

                    return (
                      <div
                        key={reviewer.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          border: '1px solid var(--outline-variant)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: assigned
                            ? 'var(--surface-container-low)'
                            : 'var(--surface)',
                        }}
                      >
                        <div>
                          <h3
                            className="text-title-md"
                            style={{
                              fontWeight: 700,
                              marginBottom: '4px',
                            }}
                          >
                            {getFullName(reviewer)}
                          </h3>

                          <div
                            className="text-caption"
                            style={{
                              color: 'var(--on-surface-variant)',
                              marginBottom: '8px',
                            }}
                          >
                            {reviewer.email}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <Badge variant="neutral">{reviewer.role}</Badge>
                            <Badge variant="info">{reviewer.department}</Badge>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          icon={<UserPlus size={16} />}
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleAssign(reviewer)}
                          disabled={assigned}
                        >
                          {assigned ? 'Asignado' : 'Asignar'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader
              style={{
                backgroundColor: 'var(--surface-container-low)',
              }}
            >
              <h2
                className="text-title-lg"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Users size={20} />
                Jurados asignados
              </h2>
            </CardHeader>

            <CardContent>
              {assignedReviewers.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  No hay jurados asignados aún.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  {assignedReviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--surface-container-lowest)',
                        border: '1px solid var(--outline-variant)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {getFullName(reviewer)}
                        </span>

                        <span
                          className="text-caption"
                          style={{ color: 'var(--on-surface-variant)' }}
                        >
                          {reviewer.role}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(reviewer.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--error)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Quitar revisor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  borderTop: '1px solid var(--outline-variant)',
                  marginTop: '20px',
                  paddingTop: '20px',
                }}
              >
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={handleConfirm}
                  disabled={assignedReviewers.length === 0}
                >
                  Confirmar asignación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignReviewers;