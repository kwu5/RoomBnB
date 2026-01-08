import api from './api'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  ApiResponse,
} from '@/types'

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    )
    return response.data.data
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    )
    return response.data.data
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data)
    return response.data.data
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> => {
    await api.put('/auth/change-password', data)
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post<ApiResponse<User>>('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  // Delete avatar
  deleteAvatar: async (): Promise<User> => {
    const response = await api.delete<ApiResponse<User>>('/auth/avatar')
    return response.data.data
  },

  // Logout user (client-side)
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Save auth data to localStorage
  saveAuthData: (authResponse: AuthResponse) => {
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
  },

  // Get saved auth data from localStorage
  getAuthData: (): { user: User; token: string } | null => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        return { user, token }
      } catch {
        return null
      }
    }

    return null
  },
}
