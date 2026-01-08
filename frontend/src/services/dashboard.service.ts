import api from './api'
import type { ApiResponse, Booking, Property, User } from '@/types'

export interface GuestDashboard {
  upcomingTrips: (Booking & { property: Property })[]
  pastTrips: (Booking & { property: Property })[]
  pendingReviews: (Booking & { property: Property })[]
  favoriteCount: number
  totalTrips: number
}

export interface HostDashboard {
  totalListings: number
  activeListings: number
  pendingBookings: (Booking & { property: Property; guest: User })[]
  upcomingBookings: (Booking & { property: Property; guest: User })[]
  recentBookings: (Booking & { property: Property; guest: User })[]
  totalEarnings: number
  thisMonthEarnings: number
  pendingGuestReviews: (Booking & { property: Property; guest: User })[]
  averageRating: number | null
  totalReviews: number
}

export const dashboardService = {
  // Get guest dashboard data
  getGuestDashboard: async (): Promise<GuestDashboard> => {
    const response = await api.get<ApiResponse<GuestDashboard>>('/dashboard/guest')
    return response.data.data
  },

  // Get host dashboard data
  getHostDashboard: async (): Promise<HostDashboard> => {
    const response = await api.get<ApiResponse<HostDashboard>>('/dashboard/host')
    return response.data.data
  },
}
