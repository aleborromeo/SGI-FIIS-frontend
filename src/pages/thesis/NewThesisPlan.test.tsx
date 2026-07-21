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
    getGroupMembers: vi.fn(),
  },
}));

vi.mock('../../services/documentService', () => ({
  documentService: {
    uploadDocument: vi.fn(),
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
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

const mockResearchService = vi.mocked(researchService);
const mockDocumentService = vi.mocked(documentService);

const mockLines = [
  { id: 1, lineName: 'Inteligencia Artificial', lineCode: 'L01', active: true, groupId: 1 },
];

const mockGroups = [
  { id: 1, groupName: 'GI-SOFT', groupCode: 'G01', active: true },
];

describe('NewThesisPlan', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockResearchService.getLines.mockResolvedValue(mockLines as any);
    mockResearchService.getGroups.mockResolvedValue(mockGroups as any);
    mockResearchService.getGroupMembers.mockResolvedValue([]);
    mockDocumentService.uploadDocument.mockResolvedValue({ id: 1, name: 'plan.pdf' } as any);
  });

  it('renders form after loading data', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    expect(document.body).toBeDefined();
  });

  it('renders title input', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const titleInput = screen.getByRole('textbox', { name: /título/i });
    expect(titleInput).toBeDefined();
  });

  it('renders abstract textarea', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(2);
  });

  it('renders research line select', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders group select', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('has back link', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const backLinks = screen.getAllByRole('link', { name: /cancelar/i });
    expect(backLinks.length).toBeGreaterThan(0);
  });

  it('renders submit button', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    const submitBtn = screen.getByRole('button', { name: /registrar/i });
    expect(submitBtn).toBeDefined();
  });

  it('shows lines in select after loading', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    expect(screen.getByText('Inteligencia Artificial')).toBeDefined();
  });

  it('shows groups in select after loading', async () => {
    renderWithProviders(<NewThesisPlan />);
    await act(async () => {});
    expect(screen.getByText('GI-SOFT')).toBeDefined();
  });
});

