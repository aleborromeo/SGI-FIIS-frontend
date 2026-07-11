import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
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

interface Tramite {
  id: number;
  type: string;
  projectName: string;
  status: 'PENDIENTE_COORDINADOR' | 'PENDIENTE_DIRECTOR' | 'PENDIENTE_DECANO' | 'APROBADO' | 'OBSERVADO';
  currentReviewer: string;
  lastObservation: string;
}

const mockTramites: Tramite[] = [
  {
    id: 1,
    type: 'Postulación de proyecto',
    projectName: 'Sistema de detección automática de enfermedades en hojas de banana usando CNN',
    status: 'PENDIENTE_COORDINADOR',
    currentReviewer: 'Coordinador de grupo (José Pérez)',
    lastObservation: 'Sin observaciones de momento.',
  },
  {
    id: 2,
    type: 'Informe trimestral (T1)',
    projectName: 'Gestión de trazabilidad de proyectos de tesis',
    status: 'OBSERVADO',
    currentReviewer: 'Director de Investigación (Carlos Mendoza)',
    lastObservation: 'Adjuntar evidencias de actividades y firmas del equipo coautor.',
  },
  {
    id: 3,
    type: 'Postulación de proyecto',
    projectName: 'Modelo predictivo para seguimiento de tesis en FIIS',
    status: 'APROBADO',
    currentReviewer: 'Trámite finalizado',
    lastObservation: 'Resolución R.D. N.° 045-2026-FIIS emitida.',
  },
  {
    id: 4,
    type: 'Informe final',
    projectName: 'Seguridad de datos en plataformas académicas',
    status: 'PENDIENTE_DECANO',
    currentReviewer: 'Decanato (Ana Rojas)',
    lastObservation: 'Firma de resolución en trámite.',
  },
];

function getStatusBadge(status: Tramite['status']) {
  switch (status) {
    case 'PENDIENTE_COORDINADOR':
      return <Badge variant="warning" icon={<Clock size={12} />}>PENDIENTE_COORDINADOR</Badge>;
    case 'PENDIENTE_DIRECTOR':
      return <Badge variant="info" icon={<Clock size={12} />}>PENDIENTE_DIRECTOR</Badge>;
    case 'PENDIENTE_DECANO':
      return <Badge variant="info" icon={<Clock size={12} />}>PENDIENTE_DECANO</Badge>;
    case 'APROBADO':
      return <Badge variant="success" icon={<CheckCircle2 size={12} />}>APROBADO</Badge>;
    case 'OBSERVADO':
      return <Badge variant="error" icon={<AlertTriangle size={12} />}>OBSERVADO</Badge>;
    default:
      return <Badge variant="neutral">Desconocido</Badge>;
  }
}

export const TramitesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockTramites.filter((t) => {
    const matchesSearch =
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} style={{ color: 'white' }} />
            </span>
            Mis Trámites
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginLeft: '54px' }}>
            Seguimiento del flujo de aprobación de proyectos, informes y resoluciones.
          </p>
        </div>
      </div>

      {/* Workflow Indicator */}
      <Card style={{ marginBottom: '24px' }}>
        <CardContent style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--primary)' }}>
            Flujo General de Firma y Trámite Institucional
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span className="step done" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', background: '#d1e7dd', color: '#0f5132', fontWeight: 600 }}>1. Investigador (Creación)</span>
            <span className="step current" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', background: '#cfe2ff', color: '#084298', fontWeight: 700 }}>2. Coordinador de Grupo (Filtro)</span>
            <span className="step" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>3. Dirección de Inv. (Revisión)</span>
            <span className="step" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>4. Decanato (Aprobación)</span>
            <span className="step" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>5. Resolución Decanal (Activar)</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
          <input
            type="text"
            placeholder="Buscar trámite o proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--outline)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '14px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)' }}
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDIENTE_COORDINADOR">Pendiente Coordinador</option>
            <option value="PENDIENTE_DIRECTOR">Pendiente Director</option>
            <option value="PENDIENTE_DECANO">Pendiente Decano</option>
            <option value="APROBADO">Aprobado</option>
            <option value="OBSERVADO">Observado</option>
          </select>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginLeft: 'auto' }}>
          {filtered.length} trámite(s) encontrado(s)
        </span>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Trámite</TableHeader>
                <TableHeader>Proyecto Relacionado</TableHeader>
                <TableHeader>Estado Actual</TableHeader>
                <TableHeader>Revisor / Ubicación</TableHeader>
                <TableHeader>Última Observación</TableHeader>
                <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell style={{ textAlign: 'center', padding: '40px' }}>
                    No hay trámites que coincidan con la búsqueda.
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ) : (
                filtered.map((tramite) => (
                  <TableRow key={tramite.id}>
                    <TableCell>
                      <strong style={{ color: 'var(--primary)' }}>{tramite.type}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>ID: TRM-{tramite.id}04</div>
                    </TableCell>
                    <TableCell style={{ maxWidth: '280px', fontSize: '13px' }}>
                      {tramite.projectName}
                    </TableCell>
                    <TableCell>{getStatusBadge(tramite.status)}</TableCell>
                    <TableCell style={{ fontSize: '13px' }}>{tramite.currentReviewer}</TableCell>
                    <TableCell style={{ maxWidth: '220px', fontSize: '12px', color: tramite.status === 'OBSERVADO' ? 'var(--error)' : 'var(--on-surface-variant)' }}>
                      {tramite.lastObservation}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {tramite.status === 'OBSERVADO' ? (
                          <Link to={`/observations/panel?procedureId=${tramite.id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="danger" icon={<RefreshCw size={14} />}>Subsanar</Button>
                          </Link>
                        ) : (
                          <Link to={`/projects/${tramite.id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="secondary" icon={<Eye size={14} />}>Ver detalle</Button>
                          </Link>
                        )}
                      </div>
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

export default TramitesList;
