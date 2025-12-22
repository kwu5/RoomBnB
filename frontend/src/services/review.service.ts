import api from './api'
import type { Review, CreateReviewData, ApiResponse } from '@/types'

export const reviewService = {
  // Create a new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/reviews', data)
    return response.data.data
  },

  // Get all reviews for a property
  getPropertyReviews: async (propertyId: string): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>(
      `/reviews/property/${propertyId}`
    )
    return response.data.data
  },

  // Check if user has reviewed a property
  getUserReview: async (propertyId: string): Promise<Review | null> => {
    const response = await api.get<ApiResponse<Review | null>>(
      `/reviews/user-review/${propertyId}`
    )
    return response.data.data
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(
      `/reviews/${reviewId}`,
      data
    )
    return response.data.data
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`)
  },
}
