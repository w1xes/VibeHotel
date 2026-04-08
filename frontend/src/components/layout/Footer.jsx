import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="font-serif text-xl font-bold text-primary">VibeHotel</span>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              A peaceful retreat nestled in nature. Unwind in our carefully curated houses, suites, and rooms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 font-sans">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/properties', label: 'Properties' },
                { to: '/about', label: 'About Us' },
                { to: '/login', label: 'Sign In' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 font-sans">Accommodations</h4>
            <ul className="space-y-2">
              {['Houses', 'Suites', 'Rooms'].map((type) => (
                <li key={type}>
                  <Link
                    to={`/properties?type=${type.toLowerCase().slice(0, -1)}`}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 font-sans">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-text-muted">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                123 Retreat Lane, Mountain Valley
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Phone className="h-4 w-4 shrink-0" />
                +1 (555) 012-3456
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <Mail className="h-4 w-4 shrink-0" />
                hello@vibehotel.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} VibeHotel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
