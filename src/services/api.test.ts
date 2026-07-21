import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildUrl, getToken, api, fetchApi } from './api';

describe('api.buildUrl', () => {
  const BASE = 'http://localhost:5173';

  it('anade prefijo /api/v1 a endpoints relativos (sin host cuando VITE_API_URL esta vacio)', () => {
    expect(buildUrl('/calls')).toBe(`${BASE}/api/v1/calls`);
  });

  it('no duplica el prefijo /api/ si ya esta presente', () => {
    expect(buildUrl('/api/v1/calls')).toBe(`${BASE}/api/v1/calls`);
  });

  it('no modifica URLs absolutas', () => {
    expect(buildUrl('https://otro.com/x')).toBe('https://otro.com/x');
  });

  it('anade / inicial si falta', () => {
    expect(buildUrl('calls')).toBe(`${BASE}/api/v1/calls`);
  });

  it('agrega query params omitiendo nulos/undefined', () => {
    const url = buildUrl('/calls', { status: 'ABIERTA', page: 2, empty: undefined, nulo: null });
    expect(url).toBe(`${BASE}/api/v1/calls?status=ABIERTA&page=2`);
  });

  it('concatena params con & si ya habia query', () => {
    const url = buildUrl('/calls?x=1', { y: 2 });
    expect(url).toBe(`${BASE}/api/v1/calls?x=1&y=2`);
  });
});

describe('api.getToken', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('retorna null sin token', () => {
    expect(getToken()).toBeNull();
  });
  it('lee sgi_token y remueve prefijo Bearer', () => {
    localStorage.setItem('sgi_token', 'Bearer abc123');
    expect(getToken()).toBe('abc123');
  });
  it('cae back a token y access_token', () => {
    localStorage.setItem('token', 'xyz');
    expect(getToken()).toBe('xyz');
    localStorage.clear();
    localStorage.setItem('access_token', 'aaa');
    expect(getToken()).toBe('aaa');
  });
});

describe('api.request', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/', pathname: '/dashboard' },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('agrega headers de auth, Accept y X-Requested-With', async () => {
    localStorage.setItem('sgi_token', 'tok');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await api.get<{ ok: number }>('/data');
    expect(res).toEqual({ ok: 1 });
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.get('Authorization')).toBe('Bearer tok');
    expect(init.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(init.headers.get('Accept')).toBe('application/json');
  });

  it('no setea Content-Type para FormData', async () => {
    const fd = new FormData();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await api.post('/upload', fd);
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers.has('Content-Type')).toBe(false);
  });

  it('retorna objeto vacio en 204', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await api.get('/noop');
    expect(res).toEqual({});
  });

  it('lanza error legible en 401 y limpia sesion', async () => {
    localStorage.setItem('sgi_token', 'tok');
    localStorage.setItem('sgi_user', 'u');
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.get('/secure')).rejects.toThrow(/Sesión expirada/);
    expect(localStorage.getItem('sgi_token')).toBeNull();
  });

  it('lanza error de permisos en 403', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.get('/secure')).rejects.toThrow(/No tiene permisos/);
  });

  it('propaga mensaje de error del backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Campo invalido' }), { status: 400, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.get('/x')).rejects.toThrow('Campo invalido');
  });

  it('fetchApi es alias de request', () => {
    expect(fetchApi).toBeInstanceOf(Function);
  });
});
