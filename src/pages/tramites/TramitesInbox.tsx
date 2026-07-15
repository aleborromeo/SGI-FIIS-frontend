import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Spinner } from '../../components/common/Spinner';
import { TramiteStatusBadge } from '../../components/business/TramiteStatusBadge';
import { getEstadoTramiteLabel, getRolLabel, getTipoTramiteLabel } from '../../utils/tramiteLabels';
import { Search, Eye, PenLine, Inbox } from 'lucide-react';
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

const formatFecha = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export const TramitesInbox: React.FC = () => {
  const { currentRole } = useContext(AuthContext);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const pendingState = currentRole ? PENDING_STATE_BY_ROLE[currentRole] : undefined;
  const isRevisor = Boolean(pendingState);

  useEffect(() => {
    const fetchTramites = isRevisor && currentRole
      ? tramiteService.getPendingForRole(currentRole)
      : tramiteService.getMyProcedures();

    fetchTramites
      .then((data) => setTramites(data))
      .catch((err: Error) => setError(err.message || 'Error al cargar los trámites'))
      .finally(() => setLoading(false));
  }, [currentRole, isRevisor]);

  const tramitesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return tramites.filter((t) => {
      if (filtroEstado && t.estadoActual !== filtroEstado) return false;
      if (filtroTipo && t.tipoTramite !== filtroTipo) return false;
      if (texto && !t.codigoTramite.toLowerCase().includes(texto) && !t.tituloReferencia.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [tramites, filtroEstado, filtroTipo, busqueda]);

  const resumen = useMemo(() => ({
    total: tramites.length,
    pendientes: tramites.filter((t) =>
      isRevisor ? t.estadoActual === pendingState : t.estadoActual.startsWith('PENDIENTE'),
    ).length,
    observados: tramites.filter((t) => t.estadoActual === 'OBSERVADO').length,
    finalizados: tramites.filter((t) =>
      t.estadoActual === 'FINALIZADO' || t.estadoActual === 'APROBADO_CON_RESOLUCION' || t.estadoActual === 'RECHAZADO'
    ).length,
  }), [tramites, isRevisor, pendingState]);

  const contadores = [
    { label: 'Total de trámites', value: resumen.total, color: 'var(--primary)' },
    { label: isRevisor ? 'Pendientes de mi revisión' : 'En revisión', value: resumen.pendientes, color: 'var(--primary)' },
    { label: 'Observados', value: resumen.observados, color: 'var(--error)' },
    { label: 'Finalizados', value: resumen.finalizados, color: 'var(--on-surface)' },
  ];

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">Bandeja de Trámites</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            {isRevisor
              ? 'Trámites pendientes de tu revisión según tu rol institucional.'
              : 'Seguimiento de tus trámites de investigación y sus subsanaciones.'}
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
                placeholder="Buscar por código o título de referencia..."
                className="input"
                style={{ paddingLeft: '36px' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  ...ESTADOS.map((estado) => ({ value: estado, label: getEstadoTramiteLabel(estado) })),
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Select
                aria-label="Filtrar por tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  ...TIPOS.map((tipo) => ({ value: tipo, label: getTipoTramiteLabel(tipo) })),
                ]}
              />
            </div>
          </div>

          {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Código</TableHeader>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Referencia</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Etapa / Revisor actual</TableHeader>
                <TableHeader>Última actualización</TableHeader>
                <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
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
                    <div className="text-body-md">No se encontraron trámites con los filtros actuales.</div>
                  </td>
                </TableRow>
              ) : (
                tramitesFiltrados.map((tramite) => {
                  const pendienteDeMi = isRevisor && tramite.estadoActual === pendingState;
                  return (
                    <TableRow key={tramite.id}>
                      <TableCell style={{ fontWeight: 600 }}>{tramite.codigoTramite}</TableCell>
                      <TableCell>
                        <Badge variant="info">{getTipoTramiteLabel(tramite.tipoTramite)}</Badge>
                      </TableCell>
                      <TableCell style={{ maxWidth: '320px', fontWeight: 500 }}>{tramite.tituloReferencia}</TableCell>
                      <TableCell>
                        <TramiteStatusBadge estado={tramite.estadoActual} />
                      </TableCell>
                      <TableCell>
                        {pendienteDeMi ? (
                          <Badge variant="warning">Pendiente de tu revisión</Badge>
                        ) : (
                          getRolLabel(tramite.rolRevisorActual)
                        )}
                      </TableCell>
                      <TableCell>{formatFecha(tramite.fechaActualizacion)}</TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <Link to={`/tramites/${tramite.id}`}>
                            <Button variant="secondary" style={{ padding: '4px 12px' }} icon={<Eye size={16} />}>
                              Ver detalle
                            </Button>
                          </Link>
                          {!isRevisor && tramite.estadoActual === 'OBSERVADO' && (
                            <Link to={`/observations/subsanacion?tramiteId=${tramite.id}`}>
                              <Button variant="primary" style={{ padding: '4px 12px' }} icon={<PenLine size={16} />}>
                                Subsanar
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
        </CardContent>
      </Card>
    </div>
  );
};
