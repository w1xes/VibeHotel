-- VibeHotel Seed Data
-- Run AFTER 001_schema.sql and 002_rls.sql
-- NOTE: Admin user must be created via Supabase Auth first (sign up via app or Dashboard),
-- then run: UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';

-- Seed properties
INSERT INTO properties (id, title, type, description, price, capacity, bedrooms, bathrooms, area, amenities, featured)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Lakeside Cottage',
    'house',
    'A charming two-story cottage overlooking the lake, surrounded by mature pine trees. Features a private dock, stone fireplace, and a wrap-around porch perfect for morning coffee.',
    220, 6, 3, 2, 140,
    ARRAY['Wi-Fi', 'Kitchen', 'Fireplace', 'Private dock', 'BBQ', 'Parking', 'Lake view'],
    TRUE
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Mountain View Suite',
    'suite',
    'An elegant suite on the upper floor with panoramic mountain views. Modern furnishings paired with natural wood accents create a serene retreat after a day of hiking.',
    150, 2, 1, 1, 55,
    ARRAY['Wi-Fi', 'Mini bar', 'Balcony', 'Mountain view', 'Room service', 'Air conditioning'],
    TRUE
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Forest Cabin',
    'house',
    'A cozy wooden cabin nestled deep in the forest. Fall asleep to the sound of a nearby stream and wake up to birdsong. Ideal for couples seeking a digital detox.',
    130, 2, 1, 1, 45,
    ARRAY['Fireplace', 'Terrace', 'Forest view', 'Parking', 'BBQ'],
    FALSE
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Garden Family House',
    'house',
    'A spacious family house with a large private garden and playground. Three bright bedrooms, a fully equipped kitchen, and a dining room that seats eight comfortably.',
    280, 8, 4, 2, 200,
    ARRAY['Wi-Fi', 'Kitchen', 'Garden', 'Playground', 'Parking', 'Washing machine', 'BBQ', 'Air conditioning'],
    TRUE
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Comfort Room',
    'room',
    'A well-appointed standard room in the main lodge. Simple yet comfortable, with quality linens, a writing desk, and views of the courtyard garden.',
    85, 2, 1, 1, 28,
    ARRAY['Wi-Fi', 'Air conditioning', 'Room service', 'Garden view'],
    FALSE
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Riverside Villa',
    'house',
    'A luxurious villa perched on the riverbank with floor-to-ceiling windows. Features a private hot tub on the terrace, a gourmet kitchen, and direct river access for kayaking.',
    350, 6, 3, 3, 180,
    ARRAY['Wi-Fi', 'Kitchen', 'Hot tub', 'Terrace', 'River view', 'Kayaks', 'Parking', 'Air conditioning'],
    FALSE
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    'Panoramic Loft',
    'suite',
    'A modern loft apartment above the main lodge with double-height ceilings and a mezzanine bedroom. The open-plan living area opens onto a wide balcony with 180° views.',
    190, 3, 1, 1, 70,
    ARRAY['Wi-Fi', 'Kitchenette', 'Balcony', 'Mountain view', 'Air conditioning', 'Smart TV'],
    FALSE
  );

-- Seed property images
INSERT INTO property_images (property_id, url, position) VALUES
  -- Lakeside Cottage
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop', 0),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', 1),
  ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 2),
  -- Mountain View Suite
  ('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop', 0),
  ('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 1),
  ('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop', 2),
  -- Forest Cabin
  ('a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop', 0),
  ('a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop', 1),
  ('a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop', 2),
  -- Garden Family House
  ('a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', 0),
  ('a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 1),
  ('a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', 2),
  -- Comfort Room
  ('a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 0),
  ('a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop', 1),
  -- Riverside Villa
  ('a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', 0),
  ('a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1600566753376-12c8ab7a079e?w=800&h=600&fit=crop', 1),
  ('a6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', 2),
  -- Panoramic Loft
  ('a7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 0),
  ('a7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 1);
