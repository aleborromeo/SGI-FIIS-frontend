const BASE_URL = '/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = localStorage.getItem('sgi_token');
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let url = `${BASE_URL}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expirado o inválido, forzar logout local
      localStorage.removeItem('sgi_token');
      localStorage.removeItem('sgi_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Sesión expirada o no autorizada. Por favor, inicie sesión de nuevo.');
    }

    if (response.status === 403) {
      throw new Error('No tiene permisos para realizar esta acción.');
    }

    if (!response.ok) {
      let errorMessage = `Error del servidor (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // No es JSON, intentar leer texto plano
        try {
          const textData = await response.text();
          if (textData) errorMessage = textData;
        } catch (innerError) {
          // Ignorar si no se puede leer
        }
      }
      throw new Error(errorMessage);
    }

    // Si no hay contenido (por ejemplo 204 No Content), retornar vacío
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: any) {
    console.error('API request error:', error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    
  put: <T>(endpoint: string, body?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    
  patch: <T>(endpoint: string, body?: any, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
