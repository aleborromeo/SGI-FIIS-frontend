import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Search, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyReviewers = [
  { id: 1, name: 'Dr. Roberto Mendoza', role: 'Docente Principal', expertise: 'Ingeniería de Software' },
  { id: 2, name: 'Dra. Elena Silva', role: 'Docente Asociada', expertise: 'Inteligencia Artificial' },
];

export const AssignReviewers: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/projects/audit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', textDecoration: 'none', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Volver al Expediente
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-headline-lg">Asignación de Jurados / Revisores</h1>
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Proyecto: <strong>FIIS-2026-001 - Sistema de detección de enfermedades</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* Left Column - Search and Add */}
        <div>
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <h2 className="text-title-lg">Buscar Docentes</h2>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <Input placeholder="Buscar por nombre o especialidad..." />
                </div>
                <Button variant="secondary" icon={<Search size={18} />}>Buscar</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dummyReviewers.map((rev) => (
                  <div key={rev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <h3 className="text-title-md" style={{ fontWeight: 600 }}>{rev.name}</h3>
                      <div className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>{rev.role} • {rev.expertise}</div>
                    </div>
                    <Button variant="secondary" icon={<UserPlus size={16} />} style={{ padding: '6px 12px' }}>Asignar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assigned Reviewers */}
        <div>
          <Card>
            <CardHeader style={{ backgroundColor: 'var(--surface-container-low)' }}>
              <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Jurados Asignados
              </h2>
            </CardHeader>
            <CardContent>
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
                No hay jurados asignados aún.
              </div>
              <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '16px', paddingTop: '16px' }}>
                <Button variant="primary" style={{ width: '100%' }}>Confirmar Asignación</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
