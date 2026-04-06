import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBookings, updateBookingStatus } from '../../services/bookingService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateRange } from '../../utils/formatDate';

const statusColor = {
  confirmed: 'success',
  completed: 'default',
  cancelled: 'error',
};

const statusOptions = ['confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['allBookings'],
    queryFn: getAllBookings,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allBookings'] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              {['Property', 'Dates', 'Guests', 'Total', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-text-muted whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings?.map((b) => (
              <tr key={b.id} className="hover:bg-surface/30">
                <td className="px-4 py-3 font-medium">{b.property?.title || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateRange(b.checkIn, b.checkOut)}
                </td>
                <td className="px-4 py-3">{b.guests}</td>
                <td className="px-4 py-3 font-medium">${b.totalPrice}</td>
                <td className="px-4 py-3">
                  <Badge color={statusColor[b.status]}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => mutation.mutate({ id: b.id, status: e.target.value })}
                    className="rounded-lg border border-border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
