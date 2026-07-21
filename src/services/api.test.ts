import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  api,
  fetchApi,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
} from './api';

describe('api utility', () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:8082/dashboard',
        pathname: '/dashboard',
      },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  describe('token retrieval and bearer trimming', () => {
    it('returns null if no token is found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{"success": true}',
      });

      await api.get('/test');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.has('Authorization')).toBe(false);
    });

    it('retrieves and formats sgi_token from localStorage', async () => {
      localStorage.setItem('sgi_token', 'Bearer abc-123');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{"success": true}',
      });

      await api.get('/test');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer abc-123');
    });

    it('retrieves token with alternative keys and strips Bearer prefix if double-added', async () => {
      localStorage.setItem('token', 'xyz-789');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{"success": true}',
      });

      await api.get('/test');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer xyz-789');
    });

    it('retrieves access_token if others are missing', async () => {
      localStorage.setItem('access_token', 'Bearer access-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{"success": true}',
      });

      await api.get('/test');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer access-token');
    });
  });

  describe('URL building and query parameters', () => {
    it('appends relative endpoints to api prefix and base url', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      await api.get('users');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('/api/v1/users');
    });

    it('keeps absolute URLs unchanged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      await api.get('https://external-api.com/data');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toBe('https://external-api.com/data');
    });

    it('builds query parameters correctly', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      await api.get('/users', {
        params: {
          search: 'john',
          active: true,
          limit: 10,
          nullVal: null,
          undefVal: undefined,
        },
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('search=john');
      expect(url).toContain('active=true');
      expect(url).toContain('limit=10');
      expect(url).not.toContain('nullVal');
      expect(url).not.toContain('undefVal');
    });

    it('merges query params if endpoint already contains question mark', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      await api.get('/users?role=ADMIN', {
        params: { active: true },
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const url = fetchCall[0] as string;
      expect(url).toContain('role=ADMIN&active=true');
    });
  });

  describe('request headers', () => {
    it('sets content type to application/json by default', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      await api.post('/users', { name: 'Alice' });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    });

    it('does not set application/json for FormData body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{}',
      });

      const formData = new FormData();
      formData.append('key', 'value');
      await api.post('/upload', formData);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.has('Content-Type')).toBe(false);
    });
  });

  describe('HTTP response status handling', () => {
    it('handles 401 expired session and redirects to /login', async () => {
      localStorage.setItem('sgi_token', 'Bearer expired-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
      });

      await expect(api.get('/users')).rejects.toThrow(
        'Sesión expirada o no autorizada. Por favor, inicie sesión de nuevo.'
      );
      expect(localStorage.getItem('sgi_token')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('does not redirect to /login on 401 if login path is already active', async () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'http://localhost:8082/login',
          pathname: '/login',
        },
      });

      localStorage.setItem('sgi_token', 'Bearer expired-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
      });

      await expect(api.get('/users')).rejects.toThrow();
      expect(window.location.href).not.toBe('/login'); // Remains untouched
    });

    it('does not redirect to /login on 401 if request is /auth/login itself', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
      });

      await expect(api.post('/auth/login', {})).rejects.toThrow();
      expect(window.location.href).not.toBe('/login');
    });

    it('handles 403 forbidden error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers(),
      });

      await expect(api.get('/users')).rejects.toThrow(
        'No tiene permisos para realizar esta acción.'
      );
    });

    it('handles other non-ok errors and parses JSON message with details', async () => {
      const errorResponse = {
        message: 'Invalid input',
        details: {
          field1: 'Must not be null',
          field2: 'Must be positive',
        },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: async () => JSON.stringify(errorResponse),
        json: async () => errorResponse,
      });

      await expect(api.post('/users', {})).rejects.toThrow(
        'Invalid input'
      );
    });

    it('handles fallback error parsing for non-JSON content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: async () => 'Internal Server Error Plain Text',
        json: async () => { throw new Error('Not JSON'); },
      });

      await expect(api.get('/users')).rejects.toThrow('Internal Server Error Plain Text');
    });
  });

  describe('JSON parsing and empty response bodies', () => {
    it('returns empty object for 204 status response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers({ 'Content-Length': '0' }),
        text: async () => '',
      });

      const result = await api.delete('/users/1');
      expect(result).toEqual({});
    });

    it('returns empty object for empty text response body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => '',
      });

      const result = await api.get('/users');
      expect(result).toEqual({});
    });

    it('returns empty object and logs warning for invalid JSON response body', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => 'Not-a-JSON-string',
      });

      const result = await api.get('/users');
      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('alternate exported helpers', () => {
    it('covers short api wrapper functions', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        status: 200,
        text: async () => '{"success": true}',
      });

      expect(await fetchApi('/test')).toEqual({ success: true });
      expect(await apiGet('/test')).toEqual({ success: true });
      expect(await apiPost('/test', {})).toEqual({ success: true });
      expect(await apiPut('/test', {})).toEqual({ success: true });
      expect(await apiPatch('/test', {})).toEqual({ success: true });
      expect(await apiDelete('/test')).toEqual({ success: true });
    });
  });
});
