import api from './api'
import type { GuestReview, CreateGuestReviewData, ApiResponse } from '@/types'

export const guestReviewService = {
  // Create a guest review (host reviews guest)
  createReview: async (data: CreateGuestReviewData): Promise<GuestReview> => {
    const response = await api.post<ApiResponse<GuestReview>>(
      '/guest-reviews',
      data
    )
    return response.data.data
  },

  // Get all reviews for a specific guest
  getGuestReviews: async (guestId: string): Promise<GuestReview[]> => {
    const response = await api.get<ApiResponse<GuestReview[]>>(
      `/guest-reviews/guest/${guestId}`
    )
    return response.data.data
  },

  // Get review for a specific booking
  getReviewByBooking: async (bookingId: string): Promise<GuestReview | null> => {
    const response = await api.get<ApiResponse<GuestReview | null>>(
      `/guest-reviews/booking/${bookingId}`
    )
    return response.data.data
  },

  // Get all reviews written by the current host
  getHostReviews: async (): Promise<GuestReview[]> => {
    const response = await api.get<ApiResponse<GuestReview[]>>(
      '/guest-reviews/host'
    )
    return response.data.data
  },

  // Update a guest review
  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<GuestReview> => {
    const response = await api.put<ApiResponse<GuestReview>>(
      `/guest-reviews/${reviewId}`,
      data
    )
    return response.data.data
  },

  // Delete a guest review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/guest-reviews/${reviewId}`)
  },
}
