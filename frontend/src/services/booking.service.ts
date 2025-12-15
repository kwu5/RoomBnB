import api from './api'
import type { Booking, CreateBookingData, ApiResponse } from '@/types'

export const bookingService = {
  // Create new booking
  createBooking: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data)
    return response.data.data
  },

  // Get user's bookings as guest
  getGuestBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/guest')
    return response.data.data
  },

  // Get bookings for host's properties
  getHostBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/host')
    return response.data.data
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`)
    return response.data.data
  },

  // Cancel booking
  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await api.put<ApiResponse<Booking>>(
      `/bookings/${id}/cancel`
    )
    return response.data.data
  },

  // Check availability for a property
  checkAvailability: async (
    propertyId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> => {
    const response = await api.get<ApiResponse<{ available: boolean }>>(
      `/bookings/check-availability`,
      {
        params: { propertyId, checkIn, checkOut },
      }
    )
    return response.data.data.available
  },
}
