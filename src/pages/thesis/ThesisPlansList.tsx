import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  Search, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  BookOpen, 
  Award, 
  ClipboardList 
} from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';
import { thesisService } from '../../services/thesisService';
import { authService } from '../../services/authService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { 
  TableContainer, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell 
} from '../../components/ui/Table';

interface ThesisPlanItem {
  idPlanTesis: number;
  tituloTesis: string;
  resumen: string;
  idEstudiante: number;
  idLinea: number;
  idGrupo: number;
  idDocumentoActual: number;
  estadoPlan: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  idTramite: number | null;
  estadoTramite: string | null;
  revisorActual: string | null;
  studentName?: string;
  groupCode?: string;
  lineName?: string;
}

export const ThesisPlansList: React.FC = () => {
  const { currentRole, user } = useContext(AuthContext);
  const [plans, setPlans] = useState<ThesisPlanItem[]>([]);
  const [pendingPlans, setPendingPlans] = useState<ThesisPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (currentRole === 'ESTUDIANTE') {
        // Estudiante: List only their own plans
        if (user?.id) {
          const response = await thesisService.getPlansByStudent(user.id.toString());
          setPlans(response as unknown as ThesisPlanItem[]);
        }
      } else if (currentRole === 'COORDINADOR_GRUPO') {
        // Coordinador: get dashboard data to find group ID, then load group plans and pending plans
        const dashboardData = await authService.getDashboardData<any>();
        const groupId = dashboardData.groupId;
        
        const [pendingData, groupData] = await Promise.all([
          thesisService.getPendingPlans('COORDINADOR_GRUPO'),
          groupId ? thesisService.getPlansByGroup(groupId.toString()) : Promise.resolve([])
        ]);

        setPendingPlans(pendingData as unknown as ThesisPlanItem[]);
        setPlans(groupData as unknown as ThesisPlanItem[]);
      } else if (currentRole === 'DIRECTOR_INVESTIGACION') {
        // Director: get pending plans for director
        const pendingData = await thesisService.getPendingPlans('DIRECTOR_INVESTIGACION');
        setPendingPlans(pendingData as unknown as ThesisPlanItem[]);
      } else if (currentRole === 'DECANO') {
        // Decano: only plans ready for signature
        const pendingData = await thesisService.getPendingPlans('DECANO');
        setPendingPlans(pendingData as unknown as ThesisPlanItem[]);
      }
    } catch (err: any) {
      console.error('Error al cargar planes de tesis:', err);
      setError(err.message || 'Error al obtener la información de planes de tesis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default tab to 'all' for students since they only see their own plans
    if (currentRole === 'ESTUDIANTE') {
      setActiveTab('all');
    } else {
      setActiveTab('pending');
    }
  }, [currentRole, user]);

  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return 'Sin estado';
    const normalized = status.toUpperCase();
    const dictionary: Record<string, string> = {
      REGISTERED: 'Registrado',
      REGISTRADO: 'Registrado',
      PENDING: 'Pendiente',
      PENDIENTE: 'Pendiente',
      UNDER_REVIEW: 'En revisión',
      EN_REVISION: 'En revisión',
      OBSERVED: 'Observado',
      OBSERVADO: 'Observado',
      APPROVED: 'Aprobado',
      APROBADO: 'Aprobado',
      REJECTED: 'Rechazado',
      RECHAZADO: 'Rechazado',
      RECTIFIED: 'Subsanado',
      SUBSANADO: 'Subsanado',
    };
    return dictionary[normalized] ?? status;
  };

  const getStatusVariant = (status: string | undefined): 'neutral' | 'info' | 'warning' | 'success' | 'error' => {
    const normalized = String(status ?? '').toUpperCase();
    if (['REGISTERED', 'REGISTRADO', 'PENDING', 'PENDIENTE', 'UNDER_REVIEW', 'EN_REVISION'].includes(normalized)) {
      return 'warning';
    }
    if (['APPROVED', 'APROBADO'].includes(normalized)) {
      return 'success';
    }
    if (['OBSERVED', 'OBSERVADO', 'REJECTED', 'RECHAZADO'].includes(normalized)) {
      return 'error';
    }
    return 'neutral';
  };

  const filteredPlans = (activeTab === 'pending' ? pendingPlans : plans).filter((plan) => {
    const search = searchTerm.toLowerCase();
    return (
      plan.tituloTesis.toLowerCase().includes(search) ||
      (plan.resumen && plan.resumen.toLowerCase().includes(search)) ||
      plan.estadoPlan.toLowerCase().includes(search)
    );
  });

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
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
          <h1 className="text-headline-lg">Planes de Tesis</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {currentRole === 'ESTUDIANTE'
              ? 'Consulta el estado de tu plan de tesis, observaciones registradas y resoluciones emitidas.'
              : 'Herramienta de revisión académica, validación y control del flujo de aprobación de tesis.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={loadData}
            disabled={loading}
          >
            Actualizar
          </Button>

          {currentRole === 'ESTUDIANTE' && (
            <Link to="/thesis/new">
              <Button icon={<Plus size={18} />}>Nuevo Plan de Tesis</Button>
            </Link>
          )}
        </div>
      </div>

      {currentRole !== 'ESTUDIANTE' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--outline-variant)' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === 'pending' ? 'bold' : 'normal',
              color: activeTab === 'pending' ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
          >
            Pendientes de Revisión ({pendingPlans.length})
          </button>
          
          {currentRole === 'COORDINADOR_GRUPO' && (
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                color: activeTab === 'all' ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Todos los Planes del Grupo ({plans.length})
            </button>
          )}
        </div>
      )}

      <Card style={{ marginBottom: '24px' }}>
        <CardContent>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
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
              placeholder="Buscar por título o estado del plan de tesis..."
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {error ? (
            <Alert title="Error al cargar la información">
              {error}
            </Alert>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
              Cargando planes de tesis...
            </div>
          ) : filteredPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--on-surface-variant)' }}>
              <GraduationCap size={48} style={{ margin: '0 auto 16px', color: 'var(--outline)' }} />
              {currentRole === 'ESTUDIANTE' ? (
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>No tienes ningún plan de tesis registrado</p>
                  <p style={{ fontSize: '14px', marginBottom: '20px' }}>Registra una propuesta de tesis para iniciar el proceso de revisión y aprobación.</p>
                  <Link to="/projects/new">
                    <Button icon={<Plus size={18} />}>Registrar mi Plan de Tesis</Button>
                  </Link>
                </div>
              ) : (
                <p>No se encontraron planes de tesis en esta bandeja.</p>
              )}
            </div>
          ) : (
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>Código</TableHeader>
                  <TableHeader>Título de Tesis</TableHeader>
                  <TableHeader>Línea / Grupo</TableHeader>
                  <TableHeader>Estado del Plan</TableHeader>
                  <TableHeader>Tramitación</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.idPlanTesis}>
                    <TableCell style={{ fontWeight: 700 }}>
                      {plan.idTramite ? `TESIS-${plan.idTramite}` : `PLAN-${plan.idPlanTesis}`}
                    </TableCell>

                    <TableCell style={{ maxWidth: '400px' }}>
                      <div style={{ fontWeight: 600 }}>{plan.tituloTesis}</div>
                      {plan.resumen && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--on-surface-variant)', 
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {plan.resumen}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="info">Línea ID: {plan.idLinea}</Badge>
                      <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--on-surface-variant)' }}>
                        Grupo ID: {plan.idGrupo}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(plan.estadoPlan)}>
                        {getStatusLabel(plan.estadoPlan)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {plan.estadoTramite ? (
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>
                            {plan.estadoTramite.replace('_', ' ')}
                          </span>
                          {plan.revisorActual && (
                            <div style={{ fontSize: '11px', color: 'var(--primary)' }}>
                              Revisor: {plan.revisorActual.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>Sin trámite activo</span>
                      )}
                    </TableCell>

                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link to={`/thesis/plan/${plan.idPlanTesis}`}>
                          <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                            Ver Detalle
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThesisPlansList;
