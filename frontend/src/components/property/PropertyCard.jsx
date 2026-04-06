import { Link } from 'react-router-dom';
import { Users, BedDouble, Bath } from 'lucide-react';
import Badge from '../ui/Badge';

const typeLabel = { house: 'House', suite: 'Suite', room: 'Room' };

export default function PropertyCard({ property }) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3" color="accent">
          {typeLabel[property.type] || property.type}
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {property.capacity}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {property.bathrooms}
          </span>
        </div>
        <p className="text-sm text-text-muted line-clamp-2">{property.description}</p>
        <p className="text-lg font-semibold text-primary">
          ${property.price}
          <span className="text-sm font-normal text-text-muted"> / night</span>
        </p>
      </div>
    </Link>
  );
}
