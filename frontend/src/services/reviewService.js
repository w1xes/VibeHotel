import { api } from '../lib/api';

function transformReview(r) {
  return {
    id: r.id,
    bookingId: r.booking_id,
    propertyId: r.property_id,
    userId: r.user_id,
    userName: r.user_name,
    comfort: r.comfort,
    cleanliness: r.cleanliness,
    location: r.location,
    price: r.price,
    avgScore: r.avg_score,
    comment: r.comment,
    createdAt: r.created_at,
  };
}

function transformSummary(s) {
  return {
    reviewCount: s.review_count,
    avgRating: s.avg_rating,
    avgComfort: s.avg_comfort,
    avgCleanliness: s.avg_cleanliness,
    avgLocation: s.avg_location,
    avgPrice: s.avg_price,
  };
}

export async function getPropertyReviews(propertyId) {
  const data = await api.get(`/reviews/property/${propertyId}`);
  return {
    reviews: data.reviews.map(transformReview),
    summary: transformSummary(data.summary),
  };
}

export async function submitReview({ bookingId, comfort, cleanliness, location, price, comment }) {
  const data = await api.post('/reviews', {
    booking_id: bookingId,
    comfort,
    cleanliness,
    location,
    price,
    comment: comment || null,
  });
  return transformReview(data);
}

export async function updateReview(reviewId, { comfort, cleanliness, location, price, comment }) {
  const data = await api.patch(`/reviews/${reviewId}`, {
    comfort,
    cleanliness,
    location,
    price,
    comment: comment || null,
  });
  return transformReview(data);
}

export async function deleteReview(reviewId) {
  return api.delete(`/reviews/${reviewId}`);
}

export async function getMyReviews() {
  const data = await api.get('/reviews/my');
  return data.map(transformReview);
}
