import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Spinner } from '../../components/common/Spinner';
import { TramiteStatusBadge } from '../../components/business/TramiteStatusBadge';
import { getEstadoTramiteLabel, getRolLabel, getTipoTramiteLabel } from '../../utils/tramiteLabels';
import { Search, Eye, PenLine, Inbox } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { tramiteService, PENDING_STATE_BY_ROLE } from '../../services/tramiteService';
import type { EstadoTramite, TipoTramite, Tramite } from '../../types/tramites';

const ESTADOS: EstadoTramite[] = [
  'REGISTRADO',
  'PENDIENTE_COORDINADOR',
  'PENDIENTE_DIRECCION',
  'PENDIENTE_DECANATO',
  'OBSERVADO',
  'SUBSANADO',
  'APROBADO_CON_RESOLUCION',
  'FINALIZADO',
  'RECHAZADO',
];

const TIPOS: TipoTramite[] = ['PROYECTO', 'PLAN_TESIS', 'INFORME_AVANCE'];

const PAGE_SIZE = 10;

const formatFecha = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export const TramitesInbox: React.FC = () => {
  const { t } = useTranslation('tramites');
  const { currentRole } = useContext(AuthContext);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

const [page, setPage] = useState(1);

  const pendingState = currentRole ? PENDING_STATE_BY_ROLE[currentRole] : undefined;
  const isRevisor = Boolean(pendingState);

  useEffect(() => {
    const fetchTramites = isRevisor && currentRole
      ? tramiteService.getPendingForRole(currentRole)
      : tramiteService.getMyProcedures();

    fetchTramites
      .then((data) => setTramites(data))
      .catch((err: Error) => setError(err.message || t('tramites:error.loadingError')))
      .finally(() => setLoading(false));
  }, [currentRole, isRevisor, t]);

  const tramitesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return tramites.filter((tramite) => {
      if (filtroEstado && tramite.estadoActual !== filtroEstado) return false;
      if (filtroTipo && tramite.tipoTramite !== filtroTipo) return false;
      if (texto && !tramite.codigoTramite.toLowerCase().includes(texto) && !tramite.tituloReferencia.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [tramites, filtroEstado, filtroTipo, busqueda]);

const totalPages = Math.ceil(tramitesFiltrados.length / PAGE_SIZE);
const paginatedTramites = tramitesFiltrados.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);

React.useEffect(() => {
  setPage(1);
}, [busqueda, filtroEstado, filtroTipo]);

  const resumen = useMemo(() => ({
    total: tramites.length,
    pendientes: tramites.filter((tramite) =>
      isRevisor ? tramite.estadoActual === pendingState : tramite.estadoActual.startsWith('PENDIENTE'),
    ).length,
    observados: tramites.filter((tramite) => tramite.estadoActual === 'OBSERVADO').length,
    finalizados: tramites.filter((tramite) =>
      tramite.estadoActual === 'FINALIZADO' || tramite.estadoActual === 'APROBADO_CON_RESOLUCION' || tramite.estadoActual === 'RECHAZADO'
    ).length,
  }), [tramites, isRevisor, pendingState]);

  const contadores = [
    { label: t('tramites:inboxPage.counters.total'), value: resumen.total, color: 'var(--primary)' },
    { label: isRevisor ? t('tramites:inboxPage.counters.pendingReview') : t('tramites:inboxPage.counters.inReview'), value: resumen.pendientes, color: 'var(--primary)' },
    { label: t('tramites:inboxPage.counters.observed'), value: resumen.observados, color: 'var(--error)' },
    { label: t('tramites:inboxPage.counters.completed'), value: resumen.finalizados, color: 'var(--on-surface)' },
  ];

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">{t('tramites:inboxPage.title')}</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {isRevisor
              ? t('tramites:inboxPage.subtitleRevisor')
              : t('tramites:inboxPage.subtitleDefault')}
          </p>
        </div>
      </div>

      {/* Contadores resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {contadores.map((item) => (
          <Card key={item.label}>
            <CardContent>
              <div className="text-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                {item.label}
              </div>
              <div className="text-headline-md" style={{ color: item.color, marginTop: '4px' }}>
                {loading ? '—' : item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
              <input
                type="text"
                placeholder={t('tramites:inboxPage.searchPlaceholder')}
                className="input"
                style={{ paddingLeft: '36px' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Select
                aria-label={t('tramites:inboxPage.filterByStatus')}
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                options={[
                  { value: '', label: t('tramites:inboxPage.allStatuses') },
                   ...ESTADOS.map((estado) => ({ value: estado, label: getEstadoTramiteLabel(estado, t) })),
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Select
                aria-label={t('tramites:inboxPage.filterByType')}
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                options={[
                  { value: '', label: t('tramites:inboxPage.allTypes') },
                   ...TIPOS.map((tipo) => ({ value: tipo, label: getTipoTramiteLabel(tipo, t) })),
                ]}
              />
            </div>
          </div>

          {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.code')}</TableHeader>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.type')}</TableHeader>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.reference')}</TableHeader>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.status')}</TableHeader>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.stageReviewer')}</TableHeader>
                <TableHeader>{t('tramites:inboxPage.tableHeaders.lastUpdate')}</TableHeader>
                <TableHeader style={{ textAlign: 'right' }}>{t('tramites:inboxPage.tableHeaders.actions')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <Spinner size="small" />
                  </td>
                </TableRow>
              ) : tramitesFiltrados.length === 0 ? (
                <TableRow>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                    <Inbox size={32} style={{ marginBottom: '8px' }} />
                    <div className="text-body-md">{t('tramites:inboxPage.emptyState')}</div>
                  </td>
                </TableRow>
              ) : (
                paginatedTramites.map((tramite) => {
                  const pendienteDeMi = isRevisor && tramite.estadoActual === pendingState;
                  return (
                    <TableRow key={tramite.id}>
                      <TableCell style={{ fontWeight: 600 }}>{tramite.codigoTramite}</TableCell>
                      <TableCell>
                        <Badge variant="info">{getTipoTramiteLabel(tramite.tipoTramite, t)}</Badge>
                      </TableCell>
                      <TableCell style={{ maxWidth: '320px', fontWeight: 500 }}>{tramite.tituloReferencia}</TableCell>
                      <TableCell>
                        <TramiteStatusBadge estado={tramite.estadoActual} />
                      </TableCell>
                      <TableCell>
                        {pendienteDeMi ? (
                          <Badge variant="warning">{t('tramites:inboxPage.pendingYourReview')}</Badge>
                        ) : (
                           getRolLabel(tramite.rolRevisorActual, t)
                        )}
                      </TableCell>
                      <TableCell>{formatFecha(tramite.fechaActualizacion)}</TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/tramites/${tramite.id}`}>
                            <Button variant="secondary" style={{ padding: '4px 12px' }} icon={<Eye size={16} />}>
                              {t('tramites:inboxPage.actions.verDetalle')}
                            </Button>
                          </Link>
                          {!isRevisor && tramite.estadoActual === 'OBSERVADO' && (
                            <Link to={`/observations/subsanacion?tramiteId=${tramite.id}`}>
                              <Button variant="primary" style={{ padding: '4px 12px' }} icon={<PenLine size={16} />}>
                                {t('tramites:inboxPage.actions.subsanar')}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </TableContainer>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={tramitesFiltrados.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};
