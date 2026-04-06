import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BedDouble, Bath, Maximize2, ArrowLeft } from 'lucide-react';
import { getProperty } from '../services/propertyService';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import PropertyGallery from '../components/property/PropertyGallery';
import AmenitiesGrid from '../components/property/AmenitiesGrid';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const typeLabel = { house: 'House', suite: 'Suite', room: 'Room' };

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setDraft = useBookingStore((s) => s.setDraft);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  const handleBookNow = () => {
    setDraft({ propertyId: property.id });
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${property.id}` } } });
    } else {
      navigate(`/book/${property.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <p className="text-text-muted mb-6">We couldn't find the property you're looking for.</p>
        <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Gallery */}
      <PropertyGallery images={property.images} title={property.title} />

      {/* Content + Sidebar */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge color="accent">{typeLabel[property.type]}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{property.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Up to {property.capacity} guests
              </span>
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" /> {property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4" /> {property.area} m²
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">About this property</h2>
            <p className="text-text-muted leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Amenities</h2>
            <AmenitiesGrid amenities={property.amenities} />
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">${property.price}</span>
              <span className="text-text-muted"> / night</span>
            </div>
            <Button onClick={handleBookNow} className="w-full" size="lg">
              Book Now
            </Button>
            <p className="text-xs text-text-muted text-center">
              Free cancellation up to 48h before check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
