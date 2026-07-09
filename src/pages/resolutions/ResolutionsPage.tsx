import React, { useState } from 'react';
import { ScrollText, Upload, Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { resolutionService } from '../../services/resolutionService';

export const ResolutionsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    numeroResolucion: '',
    fechaEmision: '',
    asunto: '',
    idTramite: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Debe adjuntar el archivo de la resolución');
      return;
    }

    if (!formData.numeroResolucion || !formData.fechaEmision || !formData.asunto || !formData.idTramite) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      await resolutionService.issueResolution({
        ...formData,
        file,
      });
      toast.success('Resolución registrada exitosamente');
      setFormData({
        numeroResolucion: '',
        fechaEmision: '',
        asunto: '',
        idTramite: '',
      });
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar la resolución');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-display-sm" style={{ color: 'var(--on-surface)' }}>
            Registro de Resoluciones
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Formalización de trámites aprobados mediante acto resolutivo
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ScrollText size={20} />
              <span className="text-title-md">Nueva Resolución</span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Número de Resolución"
                  name="numeroResolucion"
                  value={formData.numeroResolucion}
                  onChange={handleInputChange}
                  placeholder="Ej. N° 123-2026-FIIS"
                  required
                />
                <Input
                  label="Fecha de Emisión"
                  name="fechaEmision"
                  type="date"
                  value={formData.fechaEmision}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <Input
                  label="ID del Trámite"
                  name="idTramite"
                  type="number"
                  value={formData.idTramite}
                  onChange={handleInputChange}
                  placeholder="ID del trámite aprobado"
                  required
                />
                
                <div className="input-container">
                  <label className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'block' }}>
                    Asunto de la Resolución
                  </label>
                  <textarea
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--outline-variant)',
                      backgroundColor: 'var(--surface-container-lowest)',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    placeholder="Descripción del asunto resolutivo..."
                    required
                  />
                </div>
              </div>

              <div className="input-container">
                <label className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'block' }}>
                  Documento Adjunto (PDF)
                </label>
                <div
                  style={{
                    border: '2px dashed var(--outline-variant)',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--surface-container-lowest)',
                  }}
                >
                  <input
                    type="file"
                    id="resolution-upload"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resolution-upload" style={{ cursor: 'pointer' }}>
                    <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                    <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
                      {file ? file.name : 'Click para seleccionar el PDF de la resolución'}
                    </p>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save size={20} />}
                  disabled={submitting}
                >
                  {submitting ? 'Registrando...' : 'Registrar Resolución'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
