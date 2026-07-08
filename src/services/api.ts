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
        
        // Si hay detalles de validación (ej. MethodArgumentNotValidException), agregarlos
        if (errorData.details && typeof errorData.details === 'object') {
          const detailMessages = Object.values(errorData.details).join(', ');
          if (detailMessages) {
            errorMessage = `${errorMessage}: ${detailMessages}`;
          }
        }
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

export const fetchApi = request;
