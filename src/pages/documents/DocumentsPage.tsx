import React, { useState } from 'react';
import { Files, Upload, Search, Download } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { documentService } from '../../services/documentService';

export const DocumentsPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }

    setUploading(true);
    try {
      await documentService.uploadDocument(file);
      toast.success('Documento subido correctamente');
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-display-sm" style={{ color: 'var(--on-surface)' }}>
            Gestión de Documentos
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Repositorio centralizado de anexos y formatos de investigación
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={20} />
              <span className="text-title-md">Subir Nuevo Documento</span>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  border: '2px dashed var(--outline-variant)',
                  padding: '32px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--surface-container-lowest)',
                }}
              >
                <input
                  type="file"
                  id="document-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="document-upload" style={{ cursor: 'pointer' }}>
                  <Files size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                    {file ? file.name : 'Click para seleccionar un archivo PDF o DOCX'}
                  </p>
                </label>
              </div>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{ width: '100%' }}
              >
                {uploading ? 'Subiendo...' : 'Subir Archivo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} />
              <span className="text-title-md">Documentos Recientes</span>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="Buscar documentos..."
              />
            </div>
            
            {/* Mocked list since there is no GET API for listing */}
            <div style={{ border: '1px solid var(--outline-variant)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--outline-variant)' }}>Nombre</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--outline-variant)' }}>Fecha</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--outline-variant)' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Anexo_1_Formato.pdf</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>08/07/2026</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--outline-variant)' }}>
                      <Button variant="secondary" icon={<Download size={16} />} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Descargar</Button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>Manual_Usuario_SGI.docx</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>05/07/2026</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--outline-variant)' }}>
                      <Button variant="secondary" icon={<Download size={16} />} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Descargar</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-caption" style={{ marginTop: '12px', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              * Mostrando datos simulados hasta integrar endpoint de listado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
