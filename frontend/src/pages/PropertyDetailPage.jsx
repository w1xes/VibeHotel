import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BedDouble, Bath, Maximize2, ArrowLeft } from 'lucide-react';
import { getProperty } from '../services/propertyService';
import { getPropertyReviews } from '../services/reviewService';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import PropertyGallery from '../components/property/PropertyGallery';
import AmenitiesGrid from '../components/property/AmenitiesGrid';
import RatingBreakdown from '../components/property/RatingBreakdown';
import ReviewCard from '../components/property/ReviewCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const typeLabel = { house: 'House', suite: 'Suite', room: 'Room' };

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setDraft = useBookingStore((s) => s.setDraft);

  const today = new Date().toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(urlParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(urlParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(urlParams.get('guests')) || 1);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', slug],
    queryFn: () => getProperty(slug),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', 'property', property?.id],
    queryFn: () => getPropertyReviews(property.id),
    enabled: !!property?.id,
  });

  const handleBookNow = () => {
    setDraft({ propertyId: property.id });
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', String(guests));
    const bookPath = `/book/${property.id}${params.toString() ? `?${params.toString()}` : ''}`;
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${property.id}`, search: params.toString() ? `?${params.toString()}` : '' } } });
    } else {
      navigate(bookPath);
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

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Guest Reviews</h2>
            {reviewData?.summary?.reviewCount > 0 ? (
              <div className="space-y-4">
                <RatingBreakdown summary={reviewData.summary} />
                {reviewData.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">
                No reviews yet. Be the first to share your experience!
              </p>
            )}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">${property.price}</span>
              <span className="text-text-muted"> / night</span>
            </div>
            <Input
              label="Check-in"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                const val = e.target.value;
                setCheckIn(val);
                if (checkOut && checkOut <= val) setCheckOut('');
              }}
            />
            <Input
              label="Check-out"
              type="date"
              min={checkIn ? (() => { const d = new Date(checkIn); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <Input
              label="Guests"
              type="number"
              min={1}
              max={property.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
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
