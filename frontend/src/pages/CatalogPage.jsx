import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProperties } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { cn } from '../utils/cn';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'Houses' },
  { value: 'suite', label: 'Suites' },
  { value: 'room', label: 'Rooms' },
];

const capacityOptions = [
  { value: '', label: 'Any Guests' },
  { value: '2', label: '2+ Guests' },
  { value: '4', label: '4+ Guests' },
  { value: '6', label: '6+ Guests' },
];

const priceOptions = [
  { value: '', label: 'Any Price' },
  { value: '100', label: 'Up to $100' },
  { value: '200', label: 'Up to $200' },
  { value: '300', label: 'Up to $300' },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [type, setType] = useState(searchParams.get('type') || '');
  const [capacity, setCapacity] = useState(searchParams.get('guests') || '');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');

  const filters = useMemo(
    () => ({
      type: type || undefined,
      minCapacity: capacity ? Number(capacity) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search || undefined,
    }),
    [type, capacity, maxPrice, search]
  );

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
  });

  const clearFilters = () => {
    setType('');
    setCapacity('');
    setMaxPrice('');
    setSearch('');
    setSearchParams({});
  };

  const hasFilters = type || capacity || maxPrice || search;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-text-muted mt-1">
            {properties?.length ?? '…'} accommodation{properties?.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside
          className={cn(
            'w-full lg:w-64 shrink-0 space-y-5',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <Input
            placeholder="Search properties…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Type"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Select
            label="Guests"
            options={capacityOptions}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <Select
            label="Max Price"
            options={priceOptions}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : properties?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">No properties match your filters.</p>
              <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties?.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
