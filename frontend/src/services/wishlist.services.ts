import type { ApiResponse, Property } from "@/types";
import api from "./api";

export const wishlistService = {
    // Get user's wishlist
    getWishlist: async (): Promise<Property[]> => {
        const response = await api.get<ApiResponse<Property[]>>('/favorites')
        return response.data.data
    },
    
    // Add property to wishlist
    addToWishlist: async (propertyId: string): Promise<void> => {
      await api.post(`/favorites/${propertyId}`)
    },

    // Remove property from wishlist
    removeFromWishlist: async (propertyId: string): Promise<void> => {
      await api.delete(`/favorites/${propertyId}`)
    },

    // Check if property is in wishlist
    checkFavorite: async (propertyId: string): Promise<boolean> => {
      const response = await api.get<ApiResponse<{ isFavorited: boolean }>>(
        `/favorites/${propertyId}/check`
      )
      return response.data.data.isFavorited
    },
}