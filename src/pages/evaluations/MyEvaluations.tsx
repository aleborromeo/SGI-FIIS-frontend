import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { TableContainer, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Eye, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyEvaluations: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for evaluations
  const pendingEvaluations = [
    { id: '1', type: 'Proyecto', title: 'Impacto de la IA en la cadena de suministro', dateAssigned: '2026-06-15', deadline: '2026-06-30', status: 'Pendiente' },
    { id: '2', type: 'Tesis', title: 'Optimización de procesos industriales con IoT', dateAssigned: '2026-06-20', deadline: '2026-07-05', status: 'En Progreso' },
  ];

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-md">Mis Evaluaciones Pendientes</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Proyectos y tesis asignados para su revisión y dictamen.
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Título del Documento</TableHeader>
                <TableHeader>Fecha de Asignación</TableHeader>
                <TableHeader>Fecha Límite</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingEvaluations.map((evalItem) => (
                <TableRow key={evalItem.id}>
                  <TableCell>
                    <Badge variant={evalItem.type === 'Tesis' ? 'info' : 'neutral'}>
                      {evalItem.type}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ fontWeight: 500, maxWidth: '300px' }}>{evalItem.title}</TableCell>
                  <TableCell>{evalItem.dateAssigned}</TableCell>
                  <TableCell style={{ color: 'var(--error)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {evalItem.deadline}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={evalItem.status === 'Pendiente' ? 'warning' : 'info'}>
                      {evalItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" style={{ padding: '4px 12px' }} icon={<Eye size={16} />}>
                        Ver
                      </Button>
                      <Button 
                        variant="primary" 
                        style={{ padding: '4px 12px' }} 
                        icon={<Edit3 size={16} />}
                        onClick={() => navigate('/projects/evaluate')}
                      >
                        Evaluar
                      </Button>
                    </div>
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
