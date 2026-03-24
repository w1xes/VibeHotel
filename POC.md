# Product Requirements Document (PRD) — Proof of Concept (POC)
**Project Name:** Hotel Booking System (POC)  
**Date:** March 2026  
**Status:** Draft / In Review  

## 1. Project Overview
The objective of this Proof of Concept is to build a baseline version of a hotel room booking web application. The POC aims to validate the chosen technology stack, establish communication between the client and server sides, and implement the core user journey: from browsing available rooms to successfully booking one.

## 2. Technical Stack
* **Frontend:** React + Vite (for fast build and development), Tailwind CSS (for UI styling).
* **Backend:** Python (FastAPI or similar framework recommended for building the REST API).
* **Database & Auth:** Supabase (PostgreSQL for data storage and built-in authentication service).
* **Hosting/Deployment (Optional for POC):** Vercel (Frontend), Render/Railway (Backend).

## 3. Scope Boundaries

### ✅ In Scope
* **Authentication:** Simple user registration and login via email/password (powered by Supabase Auth).
* **Room Catalog:** Displaying a list of available hotel rooms with basic information (photos, price, description).
* **Booking:** The ability to select a room, specify check-in/check-out dates, and submit a booking request (including date conflict validation).
* **User Dashboard:** A simple page where an authenticated user can view their active bookings.

### ❌ Out of Scope
* Integration with payment gateways (Stripe, PayPal, etc.).
* Complex admin panel for hotel management (rooms will be added directly via DB or simple scripts during the POC).
* Email or SMS notifications (password reset, booking confirmation).
* Dynamic pricing and discount systems.
* User reviews and room ratings.

## 4. Data Model (High-Level)
* **Users:** `id` (UUID), `email`, `created_at`
* **Rooms:** `id`, `title`, `description`, `price_per_night`, `capacity`, `image_url`
* **Bookings:** `id`, `user_id` (FK), `room_id` (FK), `check_in_date`, `check_out_date`, `total_price`, `status`

## 5. Open Questions / Action Items
* Should we use an ORM on the backend (e.g., SQLAlchemy) or interact directly using the official `supabase-py` client?
* What date format should be standardized for data exchange between the frontend and backend (ISO 8601 recommended)?