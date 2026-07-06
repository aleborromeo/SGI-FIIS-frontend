import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import type { Project } from '../../services/projectService';

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectService.getAll()
      .then((data: any) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Error al cargar los proyectos');
        setLoading(false);
      });
  }, []);

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
          {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

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
              {loading ? (
                <TableRow>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--on-surface-variant)' }}>Cargando...</td>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--on-surface-variant)' }}>No se encontraron proyectos.</td>
                </TableRow>
              ) : (
                projects.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell style={{ fontWeight: 600 }}>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell><Badge variant="info">{item.type}</Badge></TableCell>
                    <TableCell>{item.line}</TableCell>
                    <TableCell><Badge variant="neutral">{item.status}</Badge></TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <Link to={`/projects/${item.id}`}>
                        <Button variant="secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>Ver</Button>
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
