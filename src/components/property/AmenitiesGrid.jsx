import {
  Wifi, Flame, Car, Utensils, Wind, Tv, WashingMachine,
  MountainSnow, TreePine, Waves, Umbrella, Dumbbell,
} from 'lucide-react';

const iconMap = {
  'Wi-Fi': Wifi,
  'Fireplace': Flame,
  'Parking': Car,
  'Kitchen': Utensils,
  'Kitchenette': Utensils,
  'Air conditioning': Wind,
  'Smart TV': Tv,
  'Washing machine': WashingMachine,
  'Mountain view': MountainSnow,
  'Forest view': TreePine,
  'Lake view': Waves,
  'River view': Waves,
  'Garden view': TreePine,
  'BBQ': Flame,
  'Hot tub': Umbrella,
  'Room service': Dumbbell,
};

export default function AmenitiesGrid({ amenities }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amenities.map((amenity) => {
        const Icon = iconMap[amenity] || Wifi;
        return (
          <div
            key={amenity}
            className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-text-muted"
          >
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            {amenity}
          </div>
        );
      })}
    </div>
  );
}
