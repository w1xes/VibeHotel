# VibeHotel POC Product Requirements Document

## 1. Document Purpose

This document defines the product requirements for the VibeHotel proof of concept (POC). It describes the business problem, target users, product scope, functional requirements, technical boundaries, and success criteria for the current project.

The POC is intended to demonstrate that VibeHotel can support the core workflow of a modern resort booking platform:

- guests can discover accommodations, sign in, and create bookings;
- returning users can manage their reservations;
- administrators can manage inventory and booking operations.

## 2. Product Summary

VibeHotel is a vacation rental booking platform for a single resort complex. The experience is focused on a curated set of houses, suites, and rooms located in a nature-oriented destination. The system combines a public storefront for guests with an admin panel for internal operations.

At the POC stage, the product demonstrates an end-to-end reservation flow supported by:

- a React single-page frontend;
- a FastAPI backend with role-protected APIs;
- Supabase authentication;
- PostgreSQL data storage with Row Level Security;
- Supabase Storage for property images.

## 3. Problem Statement

Small hospitality operators often need a lightweight booking system that is easier to launch and maintain than a full enterprise property management platform. They need a product that allows them to:

- present available accommodations in a polished, consumer-facing catalog;
- accept and track reservations through a secure account-based flow;
- manage listings and bookings internally without relying on multiple disconnected tools.

The current POC addresses this need for a single resort operator by validating the core booking journey and the operational admin workflow.

## 4. Vision

VibeHotel should feel like a focused direct-booking product for a boutique resort brand: visually inviting for guests, operationally simple for staff, and technically structured so it can be extended into a fuller hospitality platform.

## 5. Goals

### Business Goals

- Validate the feasibility of a direct-booking platform for a single resort complex.
- Demonstrate a guest journey from property discovery to confirmed booking.
- Demonstrate an internal admin workflow for inventory and booking management.
- Establish a clean technical baseline for future iteration.

### Product Goals

- Allow guests to browse and filter accommodations without authentication.
- Allow authenticated users to create and manage their own bookings.
- Allow admins to create, edit, and remove properties.
- Allow admins to upload property imagery and manage booking status.

### Technical Goals

- Use role-based access control between public, guest, and admin features.
- Keep the backend API aligned with the frontend booking and property flows.
- Use Supabase-managed auth and storage to reduce infrastructure overhead.
- Enforce secure access patterns with JWT verification and database RLS.

## 6. Non-Goals for the POC

The following items are intentionally out of scope for the current proof of concept:

- online payments or payment gateway integration;
- automatic availability inventory management across overlapping bookings;
- external channel integrations such as Booking.com or Airbnb;
- reviews, ratings, wishlists, or loyalty programs;
- email, SMS, or push notification workflows;
- advanced reporting, forecasting, or revenue optimization;
- multi-property enterprise operations beyond one resort complex.

## 7. Target Users

### Guest

A traveler looking for a nature-focused stay who wants to:

- browse accommodations by type, capacity, price, and keyword;
- view property details, images, and amenities;
- create a reservation with minimal friction;
- review or cancel existing reservations.

### Admin

A resort operator or staff member who needs to:

- manage the accommodation catalog;
- upload and organize property images;
- review all bookings across the system;
- update booking statuses and monitor basic operational metrics.

## 8. Value Proposition

For guests, VibeHotel offers a direct and visually clear way to discover and reserve curated accommodations.

For operators, VibeHotel offers a compact admin workflow that centralizes listing management and booking oversight without the weight of a full property management suite.

## 9. POC Scope

### Public Experience

- Landing page with brand positioning and featured properties.
- Property catalog with filters for type, guest capacity, price, and search.
- Property detail page with gallery, amenities, pricing, and booking entry point.
- Authentication page for sign-in and registration.
- About page and standard navigation structure.

### Authenticated Guest Experience

- Secure sign-in and sign-up via Supabase Auth.
- Booking flow with check-in, check-out, guest count, and booking summary.
- Personal account page with reservation history grouped by status.
- Self-service booking cancellation for eligible reservations.

### Admin Experience

- Admin dashboard with high-level operational statistics.
- Property management with create, edit, and delete actions.
- Property image upload and deletion.
- Booking management across all users.
- Manual booking status updates.

### Platform Foundation

- FastAPI REST API for properties, bookings, users, and storage.
- PostgreSQL schema for profiles, properties, property images, and bookings.
- Row Level Security policies across tables.
- JWT-based authorization and role checks.

## 10. Functional Requirements

### FR1. Authentication and Roles

- Users must be able to register and sign in with email and password.
- The system must distinguish between at least two roles: `user` and `admin`.
- Protected guest routes must require authentication.
- Admin routes must require an authenticated user with admin role.

### FR2. Property Discovery

- Guests must be able to view a list of available properties without logging in.
- Guests must be able to filter properties by type, minimum capacity, maximum price, and text search.
- Guests must be able to open a property detail page showing images, description, amenities, and base nightly price.
- The landing page should surface featured properties.

### FR3. Booking Creation

- An authenticated user must be able to create a booking for a property.
- The booking flow must collect check-in date, check-out date, and guest count.
- The system must validate that check-out is after check-in.
- The system must validate that guest count is at least 1 and does not exceed property capacity.
- The backend must calculate total booking price from nightly rate and number of nights.
- A successful booking must be created with a default `confirmed` status.

### FR4. Guest Booking Management

- A signed-in user must be able to view their own bookings.
- The account page should organize bookings into upcoming, past, and cancelled states.
- A user must only be able to cancel their own booking.
- Only bookings in `confirmed` status may be cancelled by the user.

### FR5. Admin Property Management

- An admin must be able to create a new property.
- An admin must be able to edit property fields including title, type, description, price, capacity, room counts, area, amenities, and featured flag.
- An admin must be able to delete a property.
- An admin must be able to upload and remove property images.

### FR6. Admin Booking Management

- An admin must be able to view all bookings in the system.
- An admin must be able to update booking status.
- Supported booking statuses must include `confirmed`, `completed`, and `cancelled`.

### FR7. User Profile Access

- An authenticated user must be able to retrieve their own profile.
- An authenticated user must be able to update supported profile fields.
- An admin must be able to view all user profiles.

## 11. Core User Journeys

### Journey A: Guest books a stay

1. User lands on the homepage.
2. User browses featured properties or opens the full catalog.
3. User filters listings and opens a property detail page.
4. User clicks Book Now.
5. If unauthenticated, the user is redirected to sign in or register.
6. User enters travel dates and guest count.
7. System validates input and creates the booking.
8. User receives a booking confirmation state and can review the reservation in their account.

### Journey B: Guest cancels a booking

1. Authenticated user opens their account page.
2. User reviews current reservations.
3. User selects a booking to cancel.
4. System confirms intent.
5. If the booking is eligible, status changes to `cancelled`.

### Journey C: Admin manages inventory

1. Admin signs in and opens the admin area.
2. Admin reviews dashboard metrics.
3. Admin creates or edits a property.
4. Admin uploads images and marks selected listings as featured.
5. Admin verifies that changes appear in the guest-facing catalog.

### Journey D: Admin manages bookings

1. Admin opens the bookings management view.
2. Admin reviews all reservations.
3. Admin updates booking status when operationally required.

## 12. Data Entities

The POC relies on four main entities:

- `profiles`: user identity and role data;
- `properties`: accommodation catalog records;
- `property_images`: media attached to properties;
- `bookings`: reservation records connecting a user to a property.

This structure is sufficient for a single-resort booking flow and supports future expansion into richer availability, payments, and messaging domains.

## 13. Non-Functional Requirements

### Security

- Authenticated API routes must verify Supabase-issued JWTs.
- Admin-only actions must be role protected.
- Database access should remain protected with Row Level Security.
- Service-role storage operations must remain isolated to backend code.

### Reliability

- The API should return clear validation and authorization errors.
- Core flows should be covered by automated tests for routing and schema validation.
- The application should support local development with deterministic startup steps.

### Performance

- Property listing and detail pages should load fast enough for normal local and demo usage.
- The frontend should cache server state where appropriate to reduce redundant requests.

### Maintainability

- Frontend and backend layers should remain clearly separated.
- API contracts should stay consistent with frontend service adapters.
- The project should be easy to run locally by a new contributor.

## 14. Assumptions

- The system serves one resort business, not a marketplace of many independent hosts.
- Property inventory is managed manually by admins.
- Payment is handled outside the platform for the POC.
- Booking fulfillment and operational follow-up are handled manually by staff.

## 15. Known Limitations in the Current POC

- The booking flow does not currently enforce conflict detection for overlapping bookings on the same property.
- The platform does not process payments, deposits, refunds, or invoices.
- Cancellation messaging on the frontend is product-facing, but cancellation policy enforcement is not modeled beyond status rules.
- Admin reporting is limited to lightweight dashboard metrics.
- There is no notification system for confirmations, reminders, or operational alerts.

These limitations are acceptable for the POC because the project is validating the end-to-end reservation workflow rather than full hospitality operations.

## 16. Success Criteria

The POC should be considered successful if it demonstrates the following outcomes:

- A guest can browse properties, authenticate, and complete a booking without manual database intervention.
- A guest can view their own booking history and cancel an eligible reservation.
- An admin can manage properties and booking statuses from the admin panel.
- Images can be uploaded and displayed successfully for property listings.
- The system can be run locally with documented setup steps and predictable behavior.

## 17. Future Expansion Opportunities

After the POC, the most valuable next-phase improvements are:

- booking availability conflict checks and inventory rules;
- online payment and refund support;
- email notifications and transactional messaging;
- richer search, seasonal pricing, and promotions;
- admin analytics and operational reporting;
- stronger production concerns such as audit trails and observability.

## 18. Recommended Positioning Statement

VibeHotel is a direct-booking web platform for a boutique resort complex that lets guests discover and reserve curated stays while giving staff a lightweight admin workspace for managing inventory and bookings.
