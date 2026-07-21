import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { DocumentsPage } from './DocumentsPage';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: vi.fn(),
  },
}));

const mockDocumentService = vi.mocked(documentService);

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDocumentService.uploadDocument.mockResolvedValue({ id: 1, name: 'file.pdf' } as any);
  });

  it('renders the page title', () => {
    renderWithProviders(<DocumentsPage />);
    expect(screen.getByText('Gestión de Documentos')).toBeDefined();
  });

  it('renders the upload section and recent documents table', () => {
    renderWithProviders(<DocumentsPage />);
    expect(screen.getByText('Subir Nuevo Documento')).toBeDefined();
    expect(screen.getByText('Documentos Recientes')).toBeDefined();
  });

  it('shows static documents in the table', () => {
    renderWithProviders(<DocumentsPage />);
    expect(screen.getByText('Anexo_1_Formato.pdf')).toBeDefined();
    expect(screen.getByText('Manual_Usuario_SGI.docx')).toBeDefined();
  });

  it('renders upload button as disabled when no file selected', () => {
    renderWithProviders(<DocumentsPage />);
    const uploadBtn = screen.getByRole('button', { name: /Subir Archivo/i });
    expect(uploadBtn.hasAttribute('disabled')).toBe(true);
  });

  it('shows file name after file selection', async () => {
    renderWithProviders(<DocumentsPage />);

    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByText('test.pdf')).toBeDefined();
  });

  it('enables upload button after file selection', async () => {
    renderWithProviders(<DocumentsPage />);

    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const uploadBtn = screen.getByRole('button', { name: /Subir Archivo/i });
    expect(uploadBtn.hasAttribute('disabled')).toBe(false);
  });

  it('successful upload shows toast and resets file', async () => {
    renderWithProviders(<DocumentsPage />);

    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByText('test.pdf')).toBeDefined();

    const uploadBtn = screen.getByRole('button', { name: /Subir Archivo/i });
    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(file);
    expect(await screen.findByText('Documento subido correctamente')).toBeDefined();
    expect(screen.queryByText('test.pdf')).toBeNull();
  });

  it('upload error shows toast with error message', async () => {
    mockDocumentService.uploadDocument.mockRejectedValue(new Error('Server error'));

    renderWithProviders(<DocumentsPage />);

    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const uploadBtn = screen.getByRole('button', { name: /Subir Archivo/i });
    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(await screen.findByText('Server error')).toBeDefined();
  });

  it('upload shows Subiendo... text while uploading', async () => {
    let resolveUpload: (value: any) => void;
    mockDocumentService.uploadDocument.mockImplementation(
      () => new Promise((resolve) => { resolveUpload = resolve; })
    );

    renderWithProviders(<DocumentsPage />);

    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    await act(async () => {
      Object.defineProperty(fileInput, 'files', { value: [file], writable: true, configurable: true });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const uploadBtn = screen.getByRole('button', { name: /Subir Archivo/i });
    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(screen.getByText('Subiendo...')).toBeDefined();

    await act(async () => {
      resolveUpload!({ id: 1 });
    });

    expect(screen.queryByText('Subiendo...')).toBeNull();
    expect(screen.getByText('Subir Archivo')).toBeDefined();
  });

  it('renders search input for documents', () => {
    renderWithProviders(<DocumentsPage />);
    const searchInput = screen.getByPlaceholderText('Buscar documentos...');
    expect(searchInput).toBeDefined();
  });

  it('renders download buttons for documents', () => {
    renderWithProviders(<DocumentsPage />);
    const downloadBtns = screen.getAllByRole('button', { name: /Descargar/i });
    expect(downloadBtns.length).toBe(2);
  });
});
