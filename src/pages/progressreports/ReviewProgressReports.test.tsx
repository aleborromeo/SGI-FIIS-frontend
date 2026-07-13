import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { ReviewProgressReports } from './ReviewProgressReports';
import { AuthContext } from '../../context/AuthContext';

// Mock contexts and services
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('../../context/AuthContext', () => {
  const ReactReal = require('react');
  const AuthContextMock = ReactReal.createContext({
    currentRole: 'COORDINADOR_GRUPO',
    user: { id: 1, role: 'COORDINADOR_GRUPO' },
  });
  return {
    AuthContext: AuthContextMock,
    AuthProvider: ({ children }: any) => children,
  };
});

vi.mock('../../services/progressReportService', () => {
  const mockReports = [
    {
      id: 1,
      reportNumber: 1,
      projectId: 101,
      projectTitle: 'Sistema de Riego Automatizado',
      responsibleName: 'Docente Investigador A',
      reportDate: '2026-07-13T10:00:00Z',
      physicalProgress: 50,
      financialProgress: 50,
      status: 'PENDIENTE',
      attachedDocumentId: 1,
    },
    {
      id: 2,
      reportNumber: 2,
      projectId: 102,
      projectTitle: 'Impacto de la IA en la cadena de suministro',
      responsibleName: 'Docente Investigador B',
      reportDate: '2026-07-12T10:00:00Z',
      physicalProgress: 75,
      financialProgress: 75,
      status: 'APROBADO',
      attachedDocumentId: 2,
    }
  ];

  return {
    progressReportService: {
      getPendingReports: vi.fn().mockResolvedValue(mockReports),
      getDetail: vi.fn(),
    },
  };
});

describe('ReviewProgressReports', () => {
  it('renders the title correctly', async () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    expect(await screen.findByText('Revisión de Informes de Avance')).toBeDefined();
  });

  it('renders the mock reports data', async () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    expect(await screen.findByText('Sistema de Riego Automatizado')).toBeDefined();
    expect(await screen.findByText('Impacto de la IA en la cadena de suministro')).toBeDefined();
  });

  it('renders approval and observation buttons for pending reports only', async () => {
    render(
      <MemoryRouter>
        <ReviewProgressReports />
      </MemoryRouter>
    );
    
    const approveButtons = await screen.findAllByRole('button', { name: /Derivar|Aprobar/i });
    const observeButtons = await screen.findAllByRole('button', { name: /Observar/i });
    
    expect(approveButtons.length).toBe(1);
    expect(observeButtons.length).toBe(1);
  });
});
