const API_URL = import.meta.env.VITE_API_URL ?? '';
const API_PREFIX = '/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
}

function getToken(): string | null {
  const token =
    localStorage.getItem('sgi_token') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');

  if (!token) return null;

  return token.replace(/^Bearer\s+/i, '');
}

function buildUrl(endpoint: string, params?: FetchOptions['params']): string {
  let url = endpoint;

  if (!/^https?:\/\//i.test(url)) {
    if (!url.startsWith('/')) {
      url = `/${url}`;
    }

    if (!url.startsWith('/api/')) {
      url = `${API_PREFIX}${url}`;
    }

    url = `${API_URL}${url}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const query = searchParams.toString();

    if (query) {
      url += url.includes('?') ? `&${query}` : `?${query}`;
    }
  }

  return url;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const { params, ...restOptions } = options;

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      ...restOptions,
      headers,
    });

    if (response.status === 401) {
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
      const errorText = await response.text().catch(() => '');
      let errorMessage = `Error del servidor (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Si hay detalles de validación (ej. MethodArgumentNotValidException), agregarlos
        if (errorData.details && typeof errorData.details === 'object') {
          const detailMessages = Object.values(errorData.details).join(', ');
          if (detailMessages) {
            errorMessage = `${errorMessage}: ${detailMessages}`;
          }
        }
      } catch (e) {
        // No es JSON, intentar leer texto plano

      if (errorText) {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    // Verificar si hay contenido basado en headers y status
    const contentLength = response.headers.get('Content-Length');
    if (response.status === 204 || contentLength === '0') {
      return {} as T;
    }

    // Leer la respuesta como texto primero para manejar cuerpos vacíos de forma segura
    const textData = await response.text();
    if (!textData) {
      return {} as T;
    }

    try {
      return JSON.parse(textData) as T;
    } catch (e) {
      console.warn('Response is not valid JSON:', textData);
      return {} as T;
    }
  } catch (error: any) {
    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();

    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export const fetchApi = request;

export function apiGet<T>(path: string, options?: FetchOptions): Promise<T> {
  return api.get<T>(path, options);
}

export function apiPost<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return api.post<T>(path, body, options);
}

export function apiPut<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return api.put<T>(path, body, options);
}

export function apiPatch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return api.patch<T>(path, body, options);
}

export function apiDelete<T>(path: string, options?: FetchOptions): Promise<T> {
  return api.delete<T>(path, options);
}