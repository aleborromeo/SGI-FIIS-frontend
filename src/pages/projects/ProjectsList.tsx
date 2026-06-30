import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyData = [
  { id: 'FIIS-2026-001', title: 'Sistema de detección de enfermedades en hojas de banana', type: 'Proyecto', line: 'Inteligencia Artificial', status: 'Activo', statusVariant: 'success' },
  { id: 'FIIS-2026-002', title: 'Optimización de rutas de transporte usando algoritmos genéticos', type: 'Tesis', line: 'Computación', status: 'En Evaluación', statusVariant: 'warning' },
  { id: 'FIIS-2026-003', title: 'Aplicación de Blockchain en registros académicos', type: 'Proyecto', line: 'Ingeniería de Software', status: 'Observado', statusVariant: 'error' },
  { id: 'FIIS-2026-004', title: 'Impacto del teletrabajo en la productividad local', type: 'Tesis', line: 'Sistemas de Información', status: 'Finalizado', statusVariant: 'neutral' },
];

export const ProjectsList: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">Listado de Propuestas</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Gestiona y visualiza todos los proyectos y tesis de la FIIS.</p>
        </div>
        <Link to="/projects/new">
          <Button icon={<Plus size={18} />}>Nueva Propuesta</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
              <input 
                type="text" 
                placeholder="Buscar por código, título o línea..." 
                className="input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <Button variant="secondary" icon={<Filter size={18} />}>Filtros</Button>
          </div>

          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Código</TableHeader>
                <TableHeader>Título</TableHeader>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Línea de Inv.</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader style={{ textAlign: 'right' }}>Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell style={{ fontWeight: 600 }}>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell><Badge variant="info">{item.type}</Badge></TableCell>
                  <TableCell>{item.line}</TableCell>
                  <TableCell><Badge variant={item.statusVariant as any}>{item.status}</Badge></TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <Link to="/projects/audit">
                      <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};
