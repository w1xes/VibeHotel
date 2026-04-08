import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, TreePine, Shield, Heart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedProperties } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const { data: featured, isLoading } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: getFeaturedProperties,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Your Perfect Retreat Awaits
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover handpicked houses, suites, and rooms surrounded by nature.
            Unwind in comfort, reconnect with yourself.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-3"
          >
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder="Check-in"
              className="flex-1 rounded-xl bg-white/90 px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="Check-out"
              className="flex-1 rounded-xl bg-white/90 px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="number"
              min="1"
              max="12"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Guests"
              className="flex-1 rounded-xl bg-white/90 px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" size="lg" className="rounded-xl">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: TreePine,
                title: 'Immersed in Nature',
                desc: 'Every property sits within a lush natural landscape — forests, lakes, and mountains at your doorstep.',
              },
              {
                icon: Shield,
                title: 'Trusted & Secure',
                desc: 'Verified listings, transparent pricing, and easy self-service booking and cancellation.',
              },
              {
                icon: Heart,
                title: 'Curated Comfort',
                desc: 'From cozy cabins to spacious villas, each space is designed for rest and rejuvenation.',
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-3">
                <div className="rounded-xl bg-accent/10 p-3">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-base font-semibold font-sans">{f.title}</h3>
                <p className="text-sm text-text-muted max-w-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Properties</h2>
              <p className="mt-1 text-text-muted">Our most popular retreats</p>
            </div>
            <Link
              to="/properties"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured?.slice(0, 3).map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/properties">
              <Button variant="secondary">
                View All Properties <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Escape?</h2>
          <p className="text-white/70 mb-6">
            Browse our full collection and book the retreat that speaks to you.
          </p>
          <Link to="/properties">
            <Button variant="accent" size="lg">
              Explore Properties
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
