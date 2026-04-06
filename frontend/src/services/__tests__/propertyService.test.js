/**
 * Tests for src/services/propertyService.js
 *
 * api.js is mocked so no HTTP calls occur.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../../lib/api';
import {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getProperties,
  getProperty,
  updateProperty,
} from '../propertyService';

// ---------------------------------------------------------------------------
// Sample raw API responses
// ---------------------------------------------------------------------------

const RAW_PROPERTY = {
  id: 'prop-1',
  title: 'Villa A',
  type: 'house',
  description: 'Nice',
  price: 100.0,
  capacity: 4,
  bedrooms: 2,
  bathrooms: 1,
  area: 80.0,
  amenities: ['wifi'],
  featured: false,
  images: [
    { id: 'img-2', url: 'https://example.com/b.jpg', position: 2 },
    { id: 'img-0', url: 'https://example.com/a.jpg', position: 0 },
    { id: 'img-1', url: 'https://example.com/c.jpg', position: 1 },
  ],
};

// ---------------------------------------------------------------------------
// transformProperty — tested via getProperty()
// ---------------------------------------------------------------------------

describe('transformProperty (via getProperty)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sorts images by position ascending', async () => {
    api.get.mockResolvedValue(RAW_PROPERTY);
    const result = await getProperty('prop-1');
    expect(result.imageObjects.map((i) => i.position)).toEqual([0, 1, 2]);
  });

  it('produces a flat images URL array in sorted order', async () => {
    api.get.mockResolvedValue(RAW_PROPERTY);
    const result = await getProperty('prop-1');
    expect(result.images).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/c.jpg',
      'https://example.com/b.jpg',
    ]);
  });

  it('handles missing images array gracefully', async () => {
    api.get.mockResolvedValue({ ...RAW_PROPERTY, images: undefined });
    const result = await getProperty('prop-1');
    expect(result.images).toEqual([]);
    expect(result.imageObjects).toEqual([]);
  });

  it('handles empty images array', async () => {
    api.get.mockResolvedValue({ ...RAW_PROPERTY, images: [] });
    const result = await getProperty('prop-1');
    expect(result.images).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getProperties — query string building
// ---------------------------------------------------------------------------

describe('getProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue([]);
  });

  it('calls GET /properties with no query string when no filters', async () => {
    await getProperties();
    expect(api.get).toHaveBeenCalledWith('/properties');
  });

  it('adds ?type when type filter is set', async () => {
    await getProperties({ type: 'villa' });
    expect(api.get).toHaveBeenCalledWith('/properties?type=villa');
  });

  it('adds ?min_capacity when minCapacity filter is set', async () => {
    await getProperties({ minCapacity: 4 });
    expect(api.get).toHaveBeenCalledWith('/properties?min_capacity=4');
  });

  it('adds ?max_price when maxPrice filter is set', async () => {
    await getProperties({ maxPrice: 500 });
    expect(api.get).toHaveBeenCalledWith('/properties?max_price=500');
  });

  it('combines multiple filters in a single query string', async () => {
    await getProperties({ type: 'house', minCapacity: 2 });
    const url = api.get.mock.calls[0][0];
    expect(url).toContain('type=house');
    expect(url).toContain('min_capacity=2');
  });

  it('returns transformed list', async () => {
    api.get.mockResolvedValue([RAW_PROPERTY]);
    const result = await getProperties();
    expect(result).toHaveLength(1);
    expect(result[0].images).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/c.jpg',
      'https://example.com/b.jpg',
    ]);
  });
});

// ---------------------------------------------------------------------------
// getFeaturedProperties
// ---------------------------------------------------------------------------

describe('getFeaturedProperties', () => {
  it('calls GET /properties?featured=true', async () => {
    api.get.mockResolvedValue([]);
    await getFeaturedProperties();
    expect(api.get).toHaveBeenCalledWith('/properties?featured=true');
  });
});

// ---------------------------------------------------------------------------
// Mutation helpers
// ---------------------------------------------------------------------------

describe('createProperty', () => {
  it('calls api.post and transforms result', async () => {
    api.post.mockResolvedValue({ ...RAW_PROPERTY, images: [] });
    const result = await createProperty({ title: 'X' });
    expect(api.post).toHaveBeenCalledWith('/properties', { title: 'X' });
    expect(result.images).toEqual([]);
  });
});

describe('updateProperty', () => {
  it('calls api.patch with correct path and data', async () => {
    api.patch.mockResolvedValue({ ...RAW_PROPERTY, images: [] });
    await updateProperty('prop-1', { title: 'Updated' });
    expect(api.patch).toHaveBeenCalledWith('/properties/prop-1', { title: 'Updated' });
  });
});

describe('deleteProperty', () => {
  it('calls api.delete with correct path', async () => {
    api.delete.mockResolvedValue(null);
    await deleteProperty('prop-1');
    expect(api.delete).toHaveBeenCalledWith('/properties/prop-1');
  });
});
