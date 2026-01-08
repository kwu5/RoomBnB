import api from './api'
import type { ApiResponse } from '@/types'

export interface EarningsSummary {
  totalEarnings: number
  totalBookings: number
  completedBookings: number
  averageBookingValue: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  percentageChange: number
}

export interface MonthlyEarnings {
  month: number
  year: number
  earnings: number
  bookings: number
}

export interface PropertyEarnings {
  propertyId: string
  propertyTitle: string
  propertyImage: string
  totalEarnings: number
  bookingCount: number
  averageRating: number | null
}

export interface OccupancyData {
  propertyId: string
  propertyTitle: string
  occupancyRate: number
  totalDaysBooked: number
  periodDays: number
}

export const earningsService = {
  // Get earnings summary
  getSummary: async (): Promise<EarningsSummary> => {
    const response = await api.get<ApiResponse<EarningsSummary>>(
      '/host/earnings/summary'
    )
    return response.data.data
  },

  // Get monthly earnings for a year
  getMonthlyEarnings: async (year?: number): Promise<MonthlyEarnings[]> => {
    const params = year ? `?year=${year}` : ''
    const response = await api.get<ApiResponse<MonthlyEarnings[]>>(
      `/host/earnings/monthly${params}`
    )
    return response.data.data
  },

  // Get earnings by property
  getEarningsByProperty: async (): Promise<PropertyEarnings[]> => {
    const response = await api.get<ApiResponse<PropertyEarnings[]>>(
      '/host/earnings/by-property'
    )
    return response.data.data
  },

  // Get occupancy rates
  getOccupancyRates: async (days?: number): Promise<OccupancyData[]> => {
    const params = days ? `?days=${days}` : ''
    const response = await api.get<ApiResponse<OccupancyData[]>>(
      `/host/earnings/occupancy${params}`
    )
    return response.data.data
  },
}
