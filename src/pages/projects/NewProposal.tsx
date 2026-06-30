import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Upload, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewProposal: React.FC = () => {
  return (
    <div style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg">Nueva Propuesta</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>Registra un nuevo plan de tesis o proyecto de investigación.</p>
        </div>
        <Link to="/projects">
          <Button variant="secondary" icon={<X size={18} />}>Cancelar</Button>
        </Link>
      </div>

      <Card style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Datos Generales</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Tipo de Propuesta" 
              options={[
                { value: '', label: 'Seleccione un tipo...' },
                { value: 'tesis', label: 'Plan de Tesis' },
                { value: 'proyecto', label: 'Proyecto de Investigación' }
              ]} 
            />
            <Select 
              label="Línea de Investigación" 
              options={[
                { value: '', label: 'Seleccione una línea...' },
                { value: 'sw', label: 'Ingeniería de Software' },
                { value: 'ia', label: 'Inteligencia Artificial' },
                { value: 'si', label: 'Sistemas de Información' }
              ]} 
            />
          </div>
          
          <Input label="Título del Proyecto" placeholder="Ingrese el título completo..." style={{ marginTop: '16px' }} />
          <Textarea label="Resumen (Abstract)" placeholder="Breve descripción del proyecto..." rows={4} style={{ marginTop: '16px' }} />
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2 className="text-title-lg">Documento Principal</h2>
        </CardHeader>
        <CardContent>
          <div style={{ 
            border: '2px dashed var(--outline-variant)', 
            borderRadius: 'var(--radius-md)', 
            padding: '48px 24px', 
            textAlign: 'center',
            backgroundColor: 'var(--surface-container-lowest)'
          }}>
            <Upload size={32} color="var(--on-surface-variant)" style={{ margin: '0 auto 16px' }} />
            <h3 className="text-title-lg" style={{ marginBottom: '8px' }}>Sube tu archivo PDF</h3>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '24px' }}>
              Arrastra y suelta el documento aquí, o haz clic para seleccionar.
            </p>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Button variant="secondary">Seleccionar Archivo</Button>
              <input type="file" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
            <p className="text-caption" style={{ marginTop: '16px', color: 'var(--on-surface-variant)' }}>Tamaño máximo: 10MB. Solo formato PDF.</p>
          </div>
        </CardContent>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <Link to="/projects">
          <Button variant="secondary">Guardar Borrador</Button>
        </Link>
        <Link to="/projects/audit">
          <Button variant="primary" icon={<Save size={18} />}>Enviar Propuesta</Button>
        </Link>
      </div>
    </div>
  );
};
