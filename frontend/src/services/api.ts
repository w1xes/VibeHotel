const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export const api = {
  rooms: {
    list: (params?: Record<string, string | number | boolean>) => {
      const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<{ data: unknown[]; meta: { total: number; page: number; limit: number } }>(`/api/rooms${qs}`);
    },
    getById: (id: string) =>
      request<{ data: unknown }>(`/api/rooms/${id}`),
  },
  bookings: {
    create: (body: Record<string, unknown>) =>
      request<{ data: unknown; message: string }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getById: (id: string) =>
      request<{ data: unknown }>(`/api/bookings/${id}`),
  },
};
