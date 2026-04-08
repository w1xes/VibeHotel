import { api } from '../lib/api';

function transformProperty(p) {
  const sorted = (p.images || []).sort((a, b) => a.position - b.position);
  return {
    ...p,
    imageObjects: sorted,
    images: sorted.map((img) => img.url),
  };
}

export async function getProperties(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.minCapacity) params.set('min_capacity', filters.minCapacity);
  if (filters.maxPrice) params.set('max_price', filters.maxPrice);
  if (filters.search) params.set('search', filters.search);

  const qs = params.toString();
  const data = await api.get(`/properties${qs ? `?${qs}` : ''}`);
  return data.map(transformProperty);
}

export async function getProperty(id) {
  const data = await api.get(`/properties/${id}`);
  return transformProperty(data);
}

export async function getFeaturedProperties() {
  const data = await api.get('/properties?featured=true');
  return data.map(transformProperty);
}

export async function createProperty(data) {
  const res = await api.post('/properties', data);
  return transformProperty(res);
}

export async function updateProperty(id, data) {
  const res = await api.patch(`/properties/${id}`, data);
  return transformProperty(res);
}

export async function deleteProperty(id) {
  return api.delete(`/properties/${id}`);
}
