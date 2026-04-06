import { createBrowserRouter } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import CatalogPage from '../pages/CatalogPage';
import PropertyDetailPage from '../pages/PropertyDetailPage';
import AuthPage from '../pages/AuthPage';
import BookingPage from '../pages/BookingPage';
import AccountPage from '../pages/AccountPage';
import AboutPage from '../pages/AboutPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProperties from '../pages/admin/AdminProperties';
import AdminBookings from '../pages/admin/AdminBookings';

export const router = createBrowserRouter([
  {
    element: <PageWrapper />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/properties', element: <CatalogPage /> },
      { path: '/properties/:id', element: <PropertyDetailPage /> },
      { path: '/login', element: <AuthPage /> },
      { path: '/about', element: <AboutPage /> },
      {
        path: '/book/:id',
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account',
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'properties', element: <AdminProperties /> },
          { path: 'bookings', element: <AdminBookings /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
