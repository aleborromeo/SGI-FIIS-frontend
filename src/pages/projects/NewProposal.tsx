import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Upload, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { thesisService } from '../../services/thesisService';

export const NewProposal: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    line: '',
    title: '',
    abstract: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(''); // clear error when typing
  };

  const handleSubmit = async () => {
    if (!formData.type) {
      setErrorMsg('Por favor seleccione un tipo de propuesta.');
      return;
    }
    if (!formData.line) {
      setErrorMsg('Por favor seleccione una línea de investigación.');
      return;
    }
    if (!formData.title || formData.title.length < 5) {
      setErrorMsg('El título debe tener al menos 5 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (formData.type === 'tesis') {
        await thesisService.createPlan({
          tituloTesis: formData.title,
          resumen: formData.abstract || 'Sin resumen',
          idLinea: 1,
          idGrupo: 1
        } as any);
        navigate('/thesis'); // redirect to thesis dashboard
      } else {
        await projectService.create({
          title: formData.title,
          summary: formData.abstract || 'Sin resumen',
          generalObjective: 'Objetivo general predeterminado',
          researchLineId: 1, // dummy id
          budget: 1000.0,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          executionPlace: 'FIIS UNAS',
          responsibleId: 1, // normally fetched from user
          researchGroupId: 1 // dummy group
        } as any);
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('Error creating proposal', error);
      setErrorMsg(error.message || 'Error al crear la propuesta. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

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

      {errorMsg && (
        <div style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <Card style={{ marginBottom: '32px', border: errorMsg && !formData.type ? '1px solid var(--error)' : undefined }}>
        <CardHeader>
          <h2 className="text-title-lg">Datos Generales</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Tipo de Propuesta" 
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: '', label: 'Seleccione un tipo...' },
                { value: 'tesis', label: 'Plan de Tesis' },
                { value: 'proyecto', label: 'Proyecto de Investigación' }
              ]} 
            />
            <Select 
              label="Línea de Investigación" 
              value={formData.line}
              onChange={(e) => handleChange('line', e.target.value)}
              options={[
                { value: '', label: 'Seleccione una línea...' },
                { value: 'sw', label: 'Ingeniería de Software' },
                { value: 'ia', label: 'Inteligencia Artificial' },
                { value: 'si', label: 'Sistemas de Información' }
              ]} 
            />
          </div>
          
          <Input 
            label="Título del Proyecto" 
            placeholder="Ingrese el título completo..." 
            style={{ marginTop: '16px' }} 
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          <Textarea 
            label="Resumen (Abstract)" 
            placeholder="Breve descripción del proyecto..." 
            rows={4} 
            style={{ marginTop: '16px' }} 
            value={formData.abstract}
            onChange={(e) => handleChange('abstract', e.target.value)}
          />
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
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </div>
            {selectedFile && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--primary-fixed)', borderRadius: 'var(--radius-md)', color: 'var(--on-primary-fixed)' }}>
                <strong>Archivo seleccionado:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <p className="text-caption" style={{ marginTop: '16px', color: 'var(--on-surface-variant)' }}>Tamaño máximo: 10MB. Solo formato PDF.</p>
          </div>
        </CardContent>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <Link to="/projects">
          <Button variant="secondary">Guardar Borrador</Button>
        </Link>
        <Button variant="primary" icon={<Save size={18} />} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Propuesta'}
        </Button>
      </div>
    </div>
  );
};
