import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  AlertCircle,
  File,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import {
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../../components/ui/Table';
import { documentService, type Document } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

function getFileIcon(fileType: string) {
  if (fileType?.includes('pdf')) return <FileText size={20} color="#ba1a1a" />;
  if (fileType?.includes('word') || fileType?.includes('doc'))
    return <File size={20} color="#2563eb" />;
  return <File size={20} color="var(--on-surface-variant)" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentRepository: React.FC = () => {
  const { t } = useTranslation('admin');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const toast = useToast();
  const confirm = useConfirm();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.list();
      setDocuments(data);
    } catch (err: any) {
      console.error('Error al cargar documentos:', err);
      setError(t('documents.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('documents.errorFileType'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('documents.errorFileSize'));
      return;
    }

    try {
      setUploading(true);
      await documentService.upload(file);
      toast.success(t('documents.uploadSuccess', { name: file.name }));
      loadDocuments();
    } catch (err: any) {
      toast.error(err?.message || t('documents.uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeactivate = async (doc: Document) => {
    const accepted = await confirm.confirmDialog({
      title: t('documents.confirm.deleteTitle'),
      message: t('documents.confirm.deleteMessage', { name: doc.fileName }),
      confirmText: t('documents.confirm.deleteConfirm'),
      danger: true,
    });

    if (!accepted) return;

    try {
      setProcessingId(doc.id);
      await documentService.deactivate(doc.id);
      toast.success(t('documents.toast.deleted'));
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      toast.error(t('documents.toast.errorDelete'));
    } finally {
      setProcessingId(null);
    }
  };

  const openPreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} />
            </div>
            <h1 className="text-headline-lg">{t('documents.pageTitle')}</h1>
          </div>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}
          >
            {t('documents.pageSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          <Button
            variant="primary"
            icon={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? t('documents.uploading') : t('documents.btnUpload')}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color="var(--primary)" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {documents.length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('documents.stats.documents')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <File size={24} color="#2563eb" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {documents.filter((d) => d.fileType?.includes('pdf')).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('documents.stats.pdfs')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <File size={24} color="#15803d" />
              <div>
                <strong style={{ display: 'block', fontSize: '24px' }}>
                  {documents.filter((d) => d.fileType?.includes('word') || d.fileType?.includes('doc')).length}
                </strong>
                <span style={{ color: 'var(--on-surface-variant)' }}>{t('documents.stats.word')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert title={t('documents.errorTitle')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </Alert>
        </div>
      )}

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeader>{t('documents.table.file')}</TableHeader>
            <TableHeader>{t('documents.table.type')}</TableHeader>
            <TableHeader>{t('documents.table.size')}</TableHeader>
            <TableHeader style={{ textAlign: 'right' }}>{t('documents.table.actions')}</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                {t('documents.loading')}
              </td>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
                <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                {t('documents.empty')}
              </td>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getFileIcon(doc.fileType)}
                    <span style={{ fontWeight: 600 }}>{doc.fileName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={doc.fileType?.includes('pdf') ? 'error' : 'info'}>
                    {doc.fileType?.includes('pdf')
                      ? 'PDF'
                      : doc.fileType?.includes('word') || doc.fileType?.includes('doc')
                      ? 'Word'
                      : doc.fileType || t('documents.table.unknown')}
                  </Badge>
                </TableCell>
                <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      icon={<Eye size={14} />}
                      onClick={() => openPreview(doc)}
                    >
                      {t('documents.btnView')}
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Download size={14} />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = documentService.download(doc.id);
                        link.target = '_blank';
                        link.download = doc.fileName;
                        link.click();
                      }}
                    >
                      {t('documents.btnDownload')}
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeactivate(doc)}
                      disabled={processingId === doc.id}
                      style={{ color: '#ba1a1a', borderColor: '#ba1a1a' }}
                    >
                      {t('documents.btnDelete')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              width: '90vw',
              maxWidth: '900px',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid var(--outline-variant)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{previewDoc.fileName}</span>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
              >
                <span style={{ fontSize: '24px', lineHeight: 1 }}>&times;</span>
              </button>
            </div>
            <div style={{ flex: 1, padding: '8px' }}>
              {previewDoc.fileType?.includes('pdf') ? (
                <iframe
                  src={documentService.download(previewDoc.id)}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                  title={previewDoc.fileName}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--on-surface-variant)',
                    gap: '16px',
                  }}
                >
                  <FileText size={64} style={{ opacity: 0.3 }} />
                  <p>{t('documents.preview.noWordPreview')}</p>
                  <Button
                    variant="primary"
                    icon={<Download size={16} />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = documentService.download(previewDoc.id);
                      link.target = '_blank';
                      link.download = previewDoc.fileName;
                      link.click();
                    }}
                  >
                    {t('documents.preview.downloadToView')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
