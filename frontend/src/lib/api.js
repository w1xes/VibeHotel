import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) =>
    request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  patch: (path, data) =>
    request(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) =>
    request(path, {
      method: 'POST',
      body: formData,
    }),
};
