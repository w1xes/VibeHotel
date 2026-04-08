/**
 * Tests for src/lib/api.js
 *
 * We mock the Supabase client so getAuthHeaders() returns a token we control,
 * and we replace global.fetch with a vi.fn() so no real HTTP calls are made.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock supabase BEFORE importing api so the module picks up the mock
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '../supabase';
import { api } from '../api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(status, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

function sessionWith(token) {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: token ? { access_token: token } : null },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('api.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds Authorization header when a session token exists', async () => {
    sessionWith('my-token');
    mockFetch(200, { ok: true });

    await api.get('/test');

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer my-token');
  });

  it('omits Authorization header when no session', async () => {
    sessionWith(null);
    mockFetch(200, {});

    await api.get('/test');

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('throws an error with the detail message on non-OK response', async () => {
    sessionWith('token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ detail: 'Not found' }),
    });

    await expect(api.get('/missing')).rejects.toThrow('Not found');
  });

  it('returns null on 204 No Content', async () => {
    sessionWith('token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    });

    const result = await api.get('/nothing');
    expect(result).toBeNull();
  });
});

describe('api.post', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends JSON body with correct Content-Type header', async () => {
    sessionWith('token');
    mockFetch(201, { id: '1' });

    await api.post('/items', { name: 'test' });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ name: 'test' });
  });

  it('includes Authorization alongside Content-Type', async () => {
    sessionWith('my-token');
    mockFetch(201, {});

    await api.post('/items', {});

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer my-token');
    expect(options.headers['Content-Type']).toBe('application/json');
  });
});

describe('api.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends DELETE method', async () => {
    sessionWith('token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    });

    const result = await api.delete('/items/1');
    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
    expect(result).toBeNull();
  });
});
