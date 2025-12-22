import api from './api'
import type {
  Property,
  PropertySearchParams,
  ApiResponse,
} from '@/types'

export const propertyService = {
  // Get all properties with search/filter
  getProperties: async (
    params?: PropertySearchParams
  ): Promise<Property[]> => {
    const response = await api.get<ApiResponse<Property[]>>(
      '/properties',
      { params }
    )
    return response.data.data
  },

  // Get property by ID
  getPropertyById: async (id: string): Promise<Property> => {
    const response = await api.get<ApiResponse<Property>>(`/properties/${id}`)
    return response.data.data
  },

  // Create new property (host only)
  createProperty: async (data: Partial<Property>): Promise<Property> => {
    const response = await api.post<ApiResponse<Property>>('/properties', data)
    return response.data.data
  },

  // Update property (owner only)
  updateProperty: async (
    id: string,
    data: Partial<Property>
  ): Promise<Property> => {
    const response = await api.put<ApiResponse<Property>>(
      `/properties/${id}`,
      data
    )
    return response.data.data
  },

  // Delete property (owner only)
  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`)
  },

  // Get user's properties (host)
  getMyProperties: async (): Promise<Property[]> => {
    const response = await api.get<ApiResponse<Property[]>>(
      '/properties/my-listings'
    )
    return response.data.data
  },
}
