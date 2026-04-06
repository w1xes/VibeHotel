import { properties } from './mockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getProperties(filters = {}) {
  await delay();
  let result = [...properties];

  if (filters.type) {
    result = result.filter((p) => p.type === filters.type);
  }
  if (filters.minCapacity) {
    result = result.filter((p) => p.capacity >= filters.minCapacity);
  }
  if (filters.maxPrice) {
    result = result.filter((p) => p.price <= filters.maxPrice);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getProperty(id) {
  await delay();
  const property = properties.find((p) => p.id === id);
  if (!property) throw new Error('Property not found');
  return property;
}

export async function getFeaturedProperties() {
  await delay();
  return properties.filter((p) => p.featured);
}

export async function createProperty(data) {
  await delay();
  const newProperty = { ...data, id: String(properties.length + 1) };
  properties.push(newProperty);
  return newProperty;
}

export async function updateProperty(id, data) {
  await delay();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Property not found');
  properties[idx] = { ...properties[idx], ...data };
  return properties[idx];
}

export async function deleteProperty(id) {
  await delay();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Property not found');
  properties.splice(idx, 1);
}
