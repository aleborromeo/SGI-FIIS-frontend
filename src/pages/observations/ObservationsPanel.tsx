import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { AlertCircle, CheckCircle, FileUp, MessageSquare } from 'lucide-react';

export const ObservationsPanel: React.FC = () => {
  const [justification, setJustification] = useState('');

  // Mock data para las observaciones
  const observations = [
    { id: 1, section: 'Marco Teórico', text: 'Falta citar autores más recientes (2020+).', status: 'pending' },
    { id: 2, section: 'Metodología', text: 'Justificar el tamaño de la muestra.', status: 'pending' }
  ];

  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-md">Observaciones del Jurado</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
            Proyecto: <strong>Desarrollo de Software Educativo</strong>
          </p>
        </div>
        <Badge variant="error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}>
          <AlertCircle size={18} />
          Requiere Subsanación
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Panel Izquierdo: Observaciones */}
        <div className="stack-md">
          <h3 className="text-title-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" />
            Detalle de Observaciones
          </h3>
          {observations.map(obs => (
            <Card key={obs.id}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="text-label-lg" style={{ color: 'var(--primary)', fontWeight: 700 }}>{obs.section}</span>
                  <Badge variant="warning">Pendiente</Badge>
                </div>
                <p className="text-body-md" style={{ color: 'var(--on-surface)' }}>{obs.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Panel Derecho: Subsanación */}
        <div className="stack-md">
          <h3 className="text-title-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="var(--success)" />
            Enviar Subsanación
          </h3>
          <Card>
            <CardContent className="stack-md">
              <p className="text-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Sube el documento corregido y proporciona una breve justificación o respuesta a las observaciones.
              </p>
              
              <div>
                <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Documento Corregido (PDF)</label>
                <div style={{ border: '2px dashed var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <FileUp size={32} color="var(--on-surface-variant)" style={{ marginBottom: '12px' }} />
                  <p className="text-body-md" style={{ fontWeight: 500 }}>Haz clic para subir archivo</p>
                  <p className="text-caption" style={{ color: 'var(--on-surface-variant)' }}>Máx 10MB</p>
                </div>
              </div>

              <div>
                <label className="text-label-md" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Justificación o Respuesta</label>
                <textarea 
                  className="input" 
                  rows={4} 
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Detalla cómo has resuelto las observaciones..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button variant="primary" icon={<CheckCircle size={18} />}>
                  Registrar Subsanación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
