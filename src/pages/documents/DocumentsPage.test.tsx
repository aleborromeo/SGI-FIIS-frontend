import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../../context/ToastContext';
import { DocumentsPage } from './DocumentsPage';
import { documentService } from '../../services/documentService';

const mockUploadDocument = vi.hoisted(() => vi.fn());

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: mockUploadDocument,
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <DocumentsPage />
    </ToastProvider>
  );

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Gestión de Documentos')).toBeDefined();
  });

  it('uploads a selected file', async () => {
    mockUploadDocument.mockResolvedValue({ id: 1 });
    renderPage();

    const fileInput = document.querySelector('#document-upload') as HTMLInputElement;
    const file = new File(['contenido'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Subir Archivo'));

    await waitFor(() => expect(mockUploadDocument).toHaveBeenCalledWith(file));
  });

  it('disables the upload button until a file is selected', () => {
    renderPage();
    const uploadButton = screen.getByText('Subir Archivo').closest('button') as HTMLButtonElement;
    expect(uploadButton.disabled).toBe(true);
  });
});
