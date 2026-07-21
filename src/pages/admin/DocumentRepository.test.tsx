import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { DocumentRepository } from './DocumentRepository';
import { documentService } from '../../services/documentService';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/documentService', () => ({
  documentService: {
    list: vi.fn(),
    upload: vi.fn(),
    deactivate: vi.fn(),
    download: vi.fn(),
    downloadFile: vi.fn(),
  },
}));

const mockDocumentService = vi.mocked(documentService);

describe('DocumentRepository page', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockDocumentService.list.mockResolvedValue([
      {
        id: 1,
        fileName: 'normas.pdf',
        fileType: 'application/pdf',
        fileSize: 2048,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        fileName: 'formato.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 1048576,
        createdAt: '2026-01-02T00:00:00Z',
      },
    ] as any);

    mockDocumentService.download.mockReturnValue('http://mockurl.com/1');
    mockDocumentService.upload.mockResolvedValue({} as any);
    mockDocumentService.deactivate.mockResolvedValue({} as any);
  });

  it('renders stats cards and documents table correctly', async () => {
    renderWithProviders(<DocumentRepository />);

    expect(mockDocumentService.list).toHaveBeenCalled();

    // Wait for row renders
    expect(await screen.findByText('normas.pdf')).toBeDefined();
    expect(screen.getByText('formato.docx')).toBeDefined();

    // Verification of size formats (2048 bytes = 2.0 KB, 1MB = 1.0 MB)
    expect(screen.getByText('2.0 KB')).toBeDefined();
    expect(screen.getByText('1.0 MB')).toBeDefined();

    // Verify statistics are rendered
    expect(screen.getByText('2')).toBeDefined(); // Total count of documents
  });

  it('filters documents by search term', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const searchInput = screen.getByPlaceholderText('Buscar documentos...');
    expect(searchInput).toBeDefined();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'docx' } });
    });

    expect(screen.queryByText('normas.pdf')).toBeNull();
    expect(screen.getByText('formato.docx')).toBeDefined();
  });

  it('handles file upload validation and upload trigger', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    // Target file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    // Test invalid file type
    const invalidFile = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    });
    expect(mockDocumentService.upload).not.toHaveBeenCalled();

    // Test valid file type
    const validFile = new File(['pdfcontent'], 'guias.pdf', { type: 'application/pdf' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } });
    });

    expect(mockDocumentService.upload).toHaveBeenCalledWith(validFile);
  });

  it('triggers download click', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const downloadBtns = screen.getAllByRole('button', { name: 'Descargar' });
    expect(downloadBtns[0]).toBeDefined();

    await act(async () => {
      downloadBtns[0].click();
    });

    expect(mockDocumentService.downloadFile).toHaveBeenCalledWith(1, 'normas.pdf');
  });

  it('handles preview modal opening and closing', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    // Click view for PDF
    const viewBtns = screen.getAllByRole('button', { name: 'Ver' });
    expect(viewBtns[0]).toBeDefined();

    await act(async () => {
      viewBtns[0].click();
    });

    // Preview dialog should open
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(mockDocumentService.download).toHaveBeenCalledWith(1);

    // Close preview dialog
    const closeBtn = screen.getByRole('button', { name: '×' });
    await act(async () => {
      closeBtn.click();
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('handles preview fallback for non-PDF files', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const viewBtns = screen.getAllByRole('button', { name: 'Ver' });
    expect(viewBtns[1]).toBeDefined(); // Word file

    await act(async () => {
      viewBtns[1].click();
    });

    // Word fallback message
    expect(screen.getByText(/Vista previa no disponible/i)).toBeDefined();
    
    const modalDownloadBtn = screen.getByRole('button', { name: /Descargar para ver/i });
    expect(modalDownloadBtn).toBeDefined();

    await act(async () => {
      modalDownloadBtn.click();
    });

    expect(mockDocumentService.downloadFile).toHaveBeenCalledWith(2, 'formato.docx');
  });

  it('opens confirmation modal and deactivates document', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const deleteBtns = screen.getAllByRole('button', { name: 'Eliminar' });
    expect(deleteBtns[0]).toBeDefined();

    await act(async () => {
      deleteBtns[0].click();
    });

    // Modal confirm text is "Eliminar"
    const confirmModalBtn = await screen.findAllByRole('button', { name: 'Eliminar' });
    const lastBtn = confirmModalBtn[confirmModalBtn.length - 1];
    expect(lastBtn).toBeDefined();

    await act(async () => {
      lastBtn.click();
    });

    expect(mockDocumentService.deactivate).toHaveBeenCalledWith(1);
    // norms.pdf should be removed from list
    expect(screen.queryByText('normas.pdf')).toBeNull();
  });
});
