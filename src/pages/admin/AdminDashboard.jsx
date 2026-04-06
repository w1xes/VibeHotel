import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarCheck, DollarSign, Users } from 'lucide-react';
import { getProperties } from '../../services/propertyService';
import { getAllBookings } from '../../services/bookingService';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const { data: properties } = useQuery({ queryKey: ['properties', {}], queryFn: () => getProperties() });
  const { data: bookings, isLoading } = useQuery({ queryKey: ['allBookings'], queryFn: getAllBookings });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const confirmed = bookings?.filter((b) => b.status === 'confirmed').length || 0;
  const revenue = bookings?.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.totalPrice : 0), 0) || 0;

  const stats = [
    { icon: Building2, label: 'Properties', value: properties?.length || 0, color: 'text-accent' },
    { icon: CalendarCheck, label: 'Active Bookings', value: confirmed, color: 'text-primary' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, color: 'text-success' },
    { icon: Users, label: 'Total Bookings', value: bookings?.length || 0, color: 'text-warning' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-5 space-y-2">
            <div className={`${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
