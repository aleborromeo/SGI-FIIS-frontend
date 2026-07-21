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

  it('renders documents after loading', async () => {
    renderWithProviders(<DocumentRepository />);

    expect(mockDocumentService.list).toHaveBeenCalled();
    expect(await screen.findByText('normas.pdf')).toBeDefined();
    expect(screen.getByText('formato.docx')).toBeDefined();
    expect(screen.getByText('2.0 KB')).toBeDefined();
    expect(screen.getByText('1.0 MB')).toBeDefined();
  });

  it('shows empty state when no documents exist', async () => {
    mockDocumentService.list.mockResolvedValue([]);
    renderWithProviders(<DocumentRepository />);

    expect(await screen.findByText(/No hay documentos/i)).toBeDefined();
  });

  it('filters documents by search term', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const searchInput = screen.getByPlaceholderText('Buscar documentos...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'docx' } });
    });

    expect(screen.queryByText('normas.pdf')).toBeNull();
    expect(screen.getByText('formato.docx')).toBeDefined();
  });

  it('triggers upload via file input', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const validFile = new File(['pdfcontent'], 'guias.pdf', { type: 'application/pdf' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [validFile] } });
    });

    expect(mockDocumentService.upload).toHaveBeenCalledWith(validFile);
  });

  it('triggers download when download button is clicked', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const downloadBtns = screen.getAllByRole('button', { name: /Descargar/i });
    await act(async () => {
      fireEvent.click(downloadBtns[0]);
    });

    expect(mockDocumentService.downloadFile).toHaveBeenCalledWith(1, 'normas.pdf');
  });

  it('deactivates a document with confirmation', async () => {
    renderWithProviders(<DocumentRepository />);
    expect(await screen.findByText('normas.pdf')).toBeDefined();

    const deleteBtns = screen.getAllByRole('button', { name: /Eliminar/i });
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });

    const confirmModalBtns = await screen.findAllByRole('button', { name: /Eliminar/i });
    const lastBtn = confirmModalBtns[confirmModalBtns.length - 1];
    await act(async () => {
      fireEvent.click(lastBtn);
    });

    expect(mockDocumentService.deactivate).toHaveBeenCalledWith(1);
    expect(screen.queryByText('normas.pdf')).toBeNull();
  });

  it('shows loading state while fetching documents', async () => {
    mockDocumentService.list.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<DocumentRepository />);

    expect(screen.getByText(/Cargando/i)).toBeDefined();
  });
});
