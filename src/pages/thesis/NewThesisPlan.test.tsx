import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { NewThesisPlan } from './NewThesisPlan';
import { researchService } from '../../services/researchService';
import { documentService } from '../../services/documentService';
import { api } from '../../services/api';
import { renderWithProviders } from '../../utils/testUtils';

vi.mock('../../services/researchService', () => ({
  researchService: {
    getLines: vi.fn(),
    getGroups: vi.fn(),
    getGroupLines: vi.fn(),
    getMembers: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...rest }: any) => (
      <a href={to} {...rest}>{children}</a>
    ),
  };
});

const mockResearchService = vi.mocked(researchService);
const mockDocumentService = vi.mocked(documentService);
const mockApi = vi.mocked(api);

const mockLines = [
  { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'L01', active: true, groupId: 1 },
  { id: 2, lineName: 'Redes y Seguridad', lineCode: 'L02', active: true, groupId: 2 },
];

const mockGroups = [
  { id: 1, groupName: 'GI-SOFT', groupCode: 'G01', active: true, currentCoordinatorId: 10, coordinatorFirstNames: 'Juan', coordinatorLastNames: 'Pérez' },
  { id: 2, groupName: 'GI-RED', groupCode: 'G02', active: true },
];

const mockGroupLines = [
  { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'L01', active: true, groupId: 1 },
];

const mockMembers = [
  { id: 1, userId: 10, userFirstNames: 'Juan', userLastNames: 'Pérez', userEmail: 'juan@sgi.com', active: true, userRoleCode: 'COORDINADOR_GRUPO', memberRole: 'INVESTIGADOR_PRINCIPAL' },
];

function createFile(name: string, type: string): File {
  const content = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  return new File([content], name, { type });
}

describe('NewThesisPlan', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
    mockResearchService.getGroups.mockResolvedValue(mockGroups as any);
    mockResearchService.getGroupLines.mockResolvedValue(mockGroupLines as any);
    mockResearchService.getMembers.mockResolvedValue(mockMembers as any);
    mockDocumentService.upload.mockResolvedValue({ id: 1, originalName: 'plan.pdf', extension: 'pdf' } as any);
    mockApi.post.mockResolvedValue({ id: 1 } as any);
  });

  it('shows loading state while catalogs load', () => {
    mockResearchService.getLines.mockImplementation(
      () => new Promise(() => {})
    );
    mockResearchService.getGroups.mockImplementation(
      () => new Promise(() => {})
    );
    renderWithProviders(<NewThesisPlan />);
    expect(screen.getByText(/cargando formulario/i)).toBeDefined();
  });

  it('renders form after catalogs load', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    expect(screen.getByText(/información de la tesis/i)).toBeDefined();
    expect(screen.getByText(/documento del plan/i)).toBeDefined();
  });

  it('renders title input and accepts text', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const input = screen.getByPlaceholderText(/ingresa el título completo/i);
    expect(input).toBeDefined();
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mi tesis de prueba' } });
    });
    expect((input as HTMLInputElement).value).toBe('Mi tesis de prueba');
  });

  it('renders resumen textarea and accepts text', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const textarea = screen.getByPlaceholderText(/describe brevemente/i);
    expect(textarea).toBeDefined();
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Resumen de mi tesis para validación' } });
    });
    expect((textarea as HTMLTextAreaElement).value).toBe('Resumen de mi tesis para validación');
  });

  it('renders group select with options', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    expect(screen.getByText('GI-SOFT')).toBeDefined();
    expect(screen.getByText('GI-RED')).toBeDefined();
  });

  it('renders line select disabled when no group is selected', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const lineSelect = screen.getAllByRole('combobox')[1];
    expect(lineSelect).toBeDefined();
    expect((lineSelect as HTMLSelectElement).disabled).toBe(true);
  });

  it('selecting a group fetches group lines and members', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });
    expect(mockResearchService.getGroupLines).toHaveBeenCalledWith(1);
    expect(mockResearchService.getMembers).toHaveBeenCalledWith(1);
  });

  it('line select becomes enabled after group selection', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });
    const lineSelect = screen.getAllByRole('combobox')[1];
    expect((lineSelect as HTMLSelectElement).disabled).toBe(false);
  });

  it('shows coordinator info when group with coordinator is selected', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });
    expect(screen.getByText('Juan Pérez')).toBeDefined();
  });

  it('renders file upload input', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();
  });

  it('uploads file for valid formats', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('plan.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(mockDocumentService.upload).toHaveBeenCalledWith(file);
  });

  it('rejects invalid file formats', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('image.png', 'image/png');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(mockDocumentService.upload).not.toHaveBeenCalled();
    expect(screen.getByText(/formato de archivo no válido/i)).toBeDefined();
  });

  it('shows validation error for short title', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText(/al menos 5 caracteres/i)).toBeDefined();
  });

  it('shows validation error for short resumen', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título válido para test' } });
    });
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText(/al menos 10 caracteres/i)).toBeDefined();
  });

  it('shows validation error when no group selected', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título válido para test' } });
      fireEvent.change(resumenInput, { target: { value: 'Resumen válido con más de diez caracteres' } });
    });
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText('Selecciona un grupo de investigación.')).toBeDefined();
  });

  it('shows validation error when no line selected', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título válido para test' } });
      fireEvent.change(resumenInput, { target: { value: 'Resumen válido con más de diez caracteres' } });
    });
    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText('Selecciona una línea de investigación.')).toBeDefined();
  });

  it('shows validation error when no document uploaded', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título válido para test' } });
      fireEvent.change(resumenInput, { target: { value: 'Resumen válido con más de diez caracteres' } });
    });
    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });
    const lineSelect = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.change(lineSelect, { target: { value: '1' } });
    });
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText(/subir el documento/i)).toBeDefined();
  });

  it('submits form successfully', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});

    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi tesis de prueba completa' } });
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen válido con más de diez caracteres para el test' } });
    });

    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });

    const lineSelect = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.change(lineSelect, { target: { value: '1' } });
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('plan.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/thesis/plans', expect.objectContaining({
      tituloTesis: 'Mi tesis de prueba completa',
      resumen: 'Este es un resumen válido con más de diez caracteres para el test',
      idLinea: 1,
      idGrupo: 1,
      idDocumentoActual: 1,
    }));
  });

  it('navigates to /thesis/plans on successful submit', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});

    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi tesis de prueba completa' } });
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen válido con más de diez caracteres para el test' } });
    });

    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });

    const lineSelect = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.change(lineSelect, { target: { value: '1' } });
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('plan.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/thesis/plans');
  });

  it('shows error message on submit failure', async () => {
    mockApi.post.mockRejectedValue(new Error('Error del servidor'));
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});

    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    const resumenInput = screen.getByPlaceholderText(/describe brevemente/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Mi tesis de prueba completa' } });
      fireEvent.change(resumenInput, { target: { value: 'Este es un resumen válido con más de diez caracteres para el test' } });
    });

    const groupSelect = screen.getAllByRole('combobox')[0];
    await act(async () => {
      fireEvent.change(groupSelect, { target: { value: '1' } });
    });

    const lineSelect = screen.getAllByRole('combobox')[1];
    await act(async () => {
      fireEvent.change(lineSelect, { target: { value: '1' } });
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile('plan.pdf', 'application/pdf');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('Error del servidor')).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('has cancel links pointing to /thesis/plans', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const links = screen.getAllByRole('link');
    const cancelLinks = links.filter(l => l.getAttribute('href') === '/thesis/plans');
    expect(cancelLinks.length).toBeGreaterThan(0);
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    expect(submitBtn).toBeDefined();
  });

  it('clears error message when user types', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /registrar plan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(screen.getByText(/al menos 5 caracteres/i)).toBeDefined();

    const titleInput = screen.getByPlaceholderText(/ingresa el título completo/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Nuevo título' } });
    });
    expect(screen.queryByText(/al menos 5 caracteres/i)).toBeNull();
  });
});
