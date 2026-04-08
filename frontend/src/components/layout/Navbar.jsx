import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-primary">VibeHotel</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface/60'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface text-primary'
                    : 'text-text-muted hover:text-text hover:bg-surface/60'
                )
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/account"
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
              >
                <User className="h-4 w-4" />
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-error transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden rounded-lg p-2 text-text-muted hover:bg-surface transition-colors cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:text-text hover:bg-surface/60'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:text-text hover:bg-surface/60'
                  )
                }
              >
                Admin
              </NavLink>
            )}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface/60 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/5 flex items-center gap-2 text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Button size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
