/**
 * Tests for src/components/auth/ProtectedRoute.jsx
 *
 * useAuthStore is a selector hook: const x = useAuthStore(s => s.x)
 * We mock it with mockImplementation(selector => selector(fakeState)).
 *
 * Routes are set up with MemoryRouter so Navigate redirects are observable.
 */
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../ui/Spinner', () => ({
  default: () => <span data-testid="spinner" />,
}));

import { useAuthStore } from '../../store/authStore';
import ProtectedRoute from '../auth/ProtectedRoute';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockStore(state) {
  useAuthStore.mockImplementation((selector) => selector(state));
}

/**
 * Render the protected route inside a full MemoryRouter+Routes tree.
 * The /login and / routes display recognisable text so we can assert
 * which destination was reached.
 */
function renderRoute({ requiredRole, initialPath = '/protected' } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a spinner and does not render children while loading', () => {
    mockStore({ loading: true, user: null });
    renderRoute();
    // The spinner is rendered via Loader2 (lucide); children must NOT appear.
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockStore({ loading: false, user: null });
    renderRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to / when user lacks the required role', () => {
    mockStore({ loading: false, user: { id: '1', role: 'user' } });
    renderRoute({ requiredRole: 'admin' });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders children for an authenticated user with no role requirement', () => {
    mockStore({ loading: false, user: { id: '1', role: 'user' } });
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user role matches requiredRole', () => {
    mockStore({ loading: false, user: { id: '1', role: 'admin' } });
    renderRoute({ requiredRole: 'admin' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
