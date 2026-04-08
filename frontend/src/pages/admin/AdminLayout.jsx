import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/properties', icon: Building2, label: 'Properties' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="md:w-56 shrink-0">
        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
        <nav className="flex md:flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface/60'
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
