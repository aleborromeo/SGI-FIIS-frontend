import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadSection } from './FileUploadSection';
import { projectService } from '../../../services/projectService';

vi.mock('../../../services/projectService', () => ({
  projectService: {
    uploadDocument: vi.fn(),
  },
}));

describe('FileUploadSection', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the drop zone with instructions', () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    expect(screen.getByText(/Arrastra tu archivo o haz clic/i)).toBeDefined();
    expect(screen.getByText(/PDF, DOC o DOCX/i)).toBeDefined();
  });

  it('shows uploaded document when documentId is provided', () => {
    render(<FileUploadSection documentId={42} onChange={mockOnChange} />);
    expect(screen.getByText('Documento cargado')).toBeDefined();
    expect(screen.getByText('Archivo subido correctamente')).toBeDefined();
    expect(screen.getByText(/Reemplazar/i)).toBeDefined();
  });

  it('validates file extension - rejects .txt files', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const txtFile = new File(['content'], 'readme.txt', { type: 'text/plain' });
    Object.defineProperty(txtFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Extensión no permitida/)).toBeDefined();
    });
  });

  it('accepts .pdf files', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdfFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByText('doc.pdf')).toBeDefined();
    });
    expect(screen.queryByText(/Extensión no permitida/)).toBeNull();
  });

  it('accepts .docx files', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const docxFile = new File(['content'], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    Object.defineProperty(docxFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [docxFile] } });

    await waitFor(() => {
      expect(screen.getByText('report.docx')).toBeDefined();
    });
  });

  it('rejects files exceeding 10MB', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const bigFile = new File(['x'.repeat(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [bigFile] } });

    await waitFor(() => {
      expect(screen.getByText(/excede el tamaño máximo/)).toBeDefined();
    });
  });

  it('shows upload and cancel buttons after file selection', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdfFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByText('Subir')).toBeDefined();
      expect(screen.getByText('Cancelar')).toBeDefined();
    });
  });

  it('uploads file and calls onChange on success', async () => {
    vi.mocked(projectService.uploadDocument).mockResolvedValue({
      id: 10,
      fileName: 'test.pdf',
      fileUrl: '/files/test.pdf',
    });

    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdfFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByText('Subir')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Subir'));

    await waitFor(() => {
      expect(projectService.uploadDocument).toHaveBeenCalledWith(pdfFile);
      expect(mockOnChange).toHaveBeenCalledWith(10, 'test.pdf');
    });
  });

  it('shows error when upload fails', async () => {
    vi.mocked(projectService.uploadDocument).mockRejectedValue(new Error('Server error'));

    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdfFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByText('Subir')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Subir'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeDefined();
    });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('removes selected file when cancel is clicked', async () => {
    render(<FileUploadSection documentId={null} onChange={mockOnChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdfFile, 'size', { value: 100 });

    fireEvent.change(input, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).toBeNull();
    });
  });

  it('removes uploaded document and calls onChange with null', async () => {
    render(<FileUploadSection documentId={42} onChange={mockOnChange} />);

    fireEvent.click(screen.getByText(/Reemplazar/));

    expect(mockOnChange).toHaveBeenCalledWith(null, null);
  });
});
