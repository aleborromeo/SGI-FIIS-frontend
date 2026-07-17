import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Upload, Trash2, FileText, CheckCircle } from 'lucide-react';
import { projectService } from '../../../services/projectService';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadSectionProps {
  documentId: number | null;
  onChange: (documentId: number | null, fileName: string | null) => void;
}

function validateFileExtension(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadSection({ documentId, onChange }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError('');

    if (!validateFileExtension(file)) {
      setError(`Extensión no permitida. Usa: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo excede el tamaño máximo de ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const result = await projectService.uploadDocument(selectedFile);
      setUploadedFileName(selectedFile.name);
      setSelectedFile(null);
      onChange(result.id, selectedFile.name);
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadedFileName(null);
    onChange(null, null);
  };

  const hasDocument = documentId !== null || uploadedFileName !== null;

  return (
    <Box>
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : error ? 'error.main' : 'divider',
          borderRadius: 2,
          p: 5,
          textAlign: 'center',
          bgcolor: isDragOver ? 'primary.50' : 'grey.50',
          cursor: uploading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: uploading ? 0.7 : 1,
          '&:hover': uploading ? {} : { borderColor: 'primary.main' },
        }}
      >
        <Upload size={36} style={{ margin: '0 auto 12px', display: 'block', color: isDragOver ? 'var(--primary)' : '#bdbdbd' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo o haz clic para seleccionar'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PDF, DOC o DOCX — máximo 10 MB
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {uploading && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Subiendo archivo...
          </Typography>
        </Box>
      )}

      {selectedFile && !error && !uploading && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={18} color="var(--primary)" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedFile.name}</Typography>
              <Typography variant="caption" color="text.secondary">{formatFileSize(selectedFile.size)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={handleUpload} sx={{ textTransform: 'none' }}>
              Subir
            </Button>
            <Button size="small" onClick={() => { setSelectedFile(null); setError(''); }}>
              Cancelar
            </Button>
          </Box>
        </Box>
      )}

      {hasDocument && !selectedFile && !uploading && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'success.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle size={18} color="var(--primary)" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {uploadedFileName || 'Documento cargado'}
              </Typography>
              <Typography variant="caption" color="text.secondary">Archivo subido correctamente</Typography>
            </Box>
          </Box>
          <Button size="small" color="error" onClick={handleRemove} startIcon={<Trash2 size={14} />}>
            Reemplazar
          </Button>
        </Box>
      )}
    </Box>
  );
}
