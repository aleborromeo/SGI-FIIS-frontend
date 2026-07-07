const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function getToken(): string | null {
  const token =
    localStorage.getItem('sgi_token') ??
    localStorage.getItem('token') ??
    localStorage.getItem('access_token');

  if (!token) {
    return null;
  }

  return token.replace('Bearer ', '');
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}