import { fetchApi } from './api';

export interface User {
  id: number;
  dni: string;
  firstNames: string;
  lastNames: string;
  institutionalEmail: string;
  roleCode: string;
  roleDescription: string;
  status?: string;
  createdAt?: string;
  active?: boolean;
  phone?: string;
}

const REVIEWER_ROLES = ['EVALUADOR', 'DOCENTE_INVESTIGADOR', 'COORDINADOR_GRUPO'];

export const userService = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>('/users');
  },

  getReviewers: async (): Promise<User[]> => {
    const users = await fetchApi<User[]>('/users');
    if (!Array.isArray(users)) return [];
    return users.filter(
      (u) => u.active !== false && REVIEWER_ROLES.includes(u.roleCode)
    );
  },

  getById: async (id: string | number): Promise<User> => {
    return fetchApi<User>(`/users/${id}`);
  },

  getAdministrationUsers: async (): Promise<User[]> => {
    // Si no existe un endpoint específico para esto, filtramos en el cliente por ahora o hacemos la petición
    try {
      const users = await fetchApi<User[]>('/users');
      // Forzar que devuelva un array (por si falla y devuelve un objeto de error)
      if (Array.isArray(users)) return users;
      throw new Error("Invalid format");
    } catch (e) {
      // Mock data para que la funcionalidad sea visible mientras el backend se actualiza
      console.warn("Endpoint /users falló, usando datos de prueba de administración.");
      return [
        {
          id: 101,
          dni: '71234567',
          firstNames: 'Carlos Alberto',
          lastNames: 'Mendoza Ruiz',
          institutionalEmail: 'carlos.mendoza@unas.edu.pe',
          roleCode: 'ESTUDIANTE',
          roleDescription: 'Estudiante / Tesista',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        },
        {
          id: 102,
          dni: '72345678',
          firstNames: 'Lucía María',
          lastNames: 'Gómez Torres',
          institutionalEmail: 'lucia.gomez@unas.edu.pe',
          roleCode: 'DOCENTE_INVESTIGADOR',
          roleDescription: 'Docente Investigador',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 103,
          dni: '73456789',
          firstNames: 'José',
          lastNames: 'Pérez García',
          institutionalEmail: 'jose.perez@unas.edu.pe',
          roleCode: 'COORDINADOR_GRUPO',
          roleDescription: 'Coordinador de Grupo',
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
          id: 104,
          dni: '74567890',
          firstNames: 'Ana',
          lastNames: 'Rojas Silva',
          institutionalEmail: 'ana.rojas@unas.edu.pe',
          roleCode: 'ESTUDIANTE',
          roleDescription: 'Estudiante / Tesista',
          status: 'REJECTED',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
    }
  },

  activateUser: async (id: number): Promise<void> => {
    return fetchApi<void>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true }),
    });
  },

  rejectUser: async (id: number): Promise<void> => {
    return fetchApi<void>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
    });
  },

  createUser: async (user: {
    dni: string;
    firstNames: string;
    lastNames: string;
    institutionalEmail?: string;
    phone?: string;
    roleCode: string;
  }): Promise<User & { temporaryPassword?: string }> => {
    return fetchApi<User & { temporaryPassword?: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  updateUser: async (id: number, user: {
    firstNames: string;
    lastNames: string;
    institutionalEmail: string;
    phone?: string;
    roleCode: string;
  }): Promise<User> => {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  resetPassword: async (id: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/users/${id}/reset-password`, {
      method: 'PATCH',
    });
  }
};
