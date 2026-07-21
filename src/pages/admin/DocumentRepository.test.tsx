import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { ConfirmProvider } from '../../context/ConfirmContext';
import { DocumentRepository } from './DocumentRepository';
import { documentService } from '../../services/documentService';

const mockList = vi.hoisted(() => vi.fn());
const mockDeactivate = vi.hoisted(() => vi.fn());
const mockUpload = vi.hoisted(() => vi.fn());

vi.mock('../../services/documentService', () => ({
  documentService: {
    list: mockList,
    deactivate: mockDeactivate,
    upload: mockUpload,
    downloadFile: vi.fn(),
    download: vi.fn(),
  },
}));

const renderPage = () =>
  render(
    <ToastProvider>
      <ConfirmProvider>
        <MemoryRouter>
          <DocumentRepository />
        </MemoryRouter>
      </ConfirmProvider>
    </ToastProvider>
  );

describe('DocumentRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([]);
  });

  it('renders the page title', async () => {
    renderPage();
    expect(await screen.findByText('Repositorio Documental')).toBeDefined();
  });

  it('lists documents returned by the service', async () => {
    mockList.mockResolvedValue([
      { id: 1, fileName: 'Anexo_1.pdf', fileType: 'application/pdf', fileSize: 1024 },
      { id: 2, fileName: 'Manual.docx', fileType: 'application/msword', fileSize: 2048 },
    ]);
    renderPage();

    expect(await screen.findByText('Anexo_1.pdf')).toBeDefined();
    expect(screen.getByText('Manual.docx')).toBeDefined();
  });

  it('deletes a document after confirming', async () => {
    mockList.mockResolvedValue([
      { id: 1, fileName: 'Anexo_1.pdf', fileType: 'application/pdf', fileSize: 1024 },
    ]);
    renderPage();

    await screen.findByText('Anexo_1.pdf');
    fireEvent.click(screen.getByText('Eliminar'));

    const cancel = await screen.findByText('Cancelar');
    const container = cancel.parentElement as HTMLElement;
    const confirmBtn = within(container).getAllByRole('button').find((b) => b !== cancel)!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mockDeactivate).toHaveBeenCalledWith(1));
  });

  it('uploads a selected file', async () => {
    const file = new File(['contenido'], 'nuevo.pdf', { type: 'application/pdf' });
    mockUpload.mockResolvedValue({ id: 1 });
    renderPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(file));
  });
});
