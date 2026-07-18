import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import Pagination from '../../components/ui/Pagination';

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
  nombreLinea?: string;
  nombreGrupo?: string;
  codigoGrupo?: string;
}

export const ThesisPlansList: React.FC = () => {
  const { currentRole, user } = useContext(AuthContext);
  const { t } = useTranslation('thesis');
  const [plans, setPlans] = useState<ThesisPlanItem[]>([]);
  const [pendingPlans, setPendingPlans] = useState<ThesisPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

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
      setError(err.message || t('thesis:error.loadingError'));
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

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return t('thesis:statusLabels.noStatus');
    const normalized = status.toUpperCase();
    const dictionary: Record<string, string> = {
      REGISTERED: t('thesis:statusLabels.registered'),
      REGISTRADO: t('thesis:statusLabels.registered'),
      PENDING: t('thesis:statusLabels.pending'),
      PENDIENTE: t('thesis:statusLabels.pending'),
      UNDER_REVIEW: t('thesis:statusLabels.underReview'),
      EN_REVISION: t('thesis:statusLabels.underReview'),
      OBSERVED: t('thesis:statusLabels.observed'),
      OBSERVADO: t('thesis:statusLabels.observed'),
      APPROVED: t('thesis:statusLabels.approved'),
      APROBADO: t('thesis:statusLabels.approved'),
      REJECTED: t('thesis:statusLabels.rejected'),
      RECHAZADO: t('thesis:statusLabels.rejected'),
      RECTIFIED: t('thesis:statusLabels.rectified'),
      SUBSANADO: t('thesis:statusLabels.rectified'),
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

  const totalPages = Math.ceil(filteredPlans.length / PAGE_SIZE);
  const pagedPlans = filteredPlans.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

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
          <h1 className="text-headline-lg">{t('thesis:plansList.title')}</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {currentRole === 'ESTUDIANTE'
              ? t('thesis:plansList.subtitleStudent')
              : currentRole === 'DECANO'
              ? t('thesis:plansList.subtitleDean')
              : t('thesis:plansList.subtitleDefault')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={loadData}
            disabled={loading}
          >
            {t('thesis:plansList.refresh')}
          </Button>

          {currentRole === 'ESTUDIANTE' && (
            <Link to="/thesis/new">
              <Button icon={<Plus size={18} />}>{t('thesis:plansList.newPlan')}</Button>
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
            {currentRole === 'DECANO'
              ? `${t('thesis:plansList.tabs.pendingSignature')} (${pendingPlans.length})`
              : `${t('thesis:plansList.tabs.pendingReview')} (${pendingPlans.length})`}
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
              {t('thesis:plansList.tabs.allGroupPlans')} ({plans.length})
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
              placeholder={t('thesis:plansList.searchPlaceholder')}
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {error ? (
            <Alert title={t('thesis:plansList.errorTitle')}>
              {error}
            </Alert>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
              {t('thesis:plansList.loading')}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--on-surface-variant)' }}>
              <GraduationCap size={48} style={{ margin: '0 auto 16px', color: 'var(--outline)' }} />
              {currentRole === 'ESTUDIANTE' ? (
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>{t('thesis:plansList.emptyStudentTitle')}</p>
                  <p style={{ fontSize: '14px', marginBottom: '20px' }}>{t('thesis:plansList.emptyStudentDesc')}</p>
                  <Link to="/thesis/new">
                    <Button icon={<Plus size={18} />}>{t('thesis:plansList.emptyStudentAction')}</Button>
                  </Link>
                </div>
              ) : (
                <p>{t('thesis:plansList.emptyDefault')}</p>
              )}
            </div>
          ) : (
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>{t('thesis:plansList.columns.code')}</TableHeader>
                  <TableHeader>{t('thesis:plansList.columns.title')}</TableHeader>
                  <TableHeader>{t('thesis:plansList.columns.lineGroup')}</TableHeader>
                  <TableHeader>{t('thesis:plansList.columns.planStatus')}</TableHeader>
                  <TableHeader>{t('thesis:plansList.columns.processing')}</TableHeader>
                  <TableHeader style={{ textAlign: 'right' }}>{t('thesis:plansList.columns.actions')}</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {pagedPlans.map((plan) => (
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
                      <Badge variant="info">{plan.nombreLinea || plan.lineName || `${t('thesis:plansList.lineId')} ${plan.idLinea}`}</Badge>
                      <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--on-surface-variant)' }}>
                        {plan.nombreGrupo || plan.codigoGrupo || plan.groupCode || `${t('thesis:plansList.groupId')} ${plan.idGrupo}`}
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
                              {t('thesis:plansList.reviewer')} {plan.revisorActual.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>{t('thesis:plansList.noActiveProcessing')}</span>
                      )}
                    </TableCell>

                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link to={`/thesis/plan/${plan.idPlanTesis}`}>
                          <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                            {t('thesis:plansList.viewDetail')}
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableContainer>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredPlans.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ThesisPlansList;
