import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL - use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds (for cold starts)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Handle API errors with specific messages
const handleApiError = (error: any) => {
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    throw new Error('Request timed out. The server may be starting up. Please try again in a moment.');
  }
  
  if (error.code === 'ERR_NETWORK' || !error.response) {
    throw new Error('Network error. Please check your internet connection and try again.');
  }
  
  const status = error.response?.status;
  const message = error.response?.data?.message;
  
  // Handle specific HTTP status codes
  if (status === 400 && message) {
    // Bad request - show backend validation message
    throw new Error(message);
  }
  
  if (status === 409) {
    // Conflict - usually duplicate email/phone
    throw new Error(message || 'This email or phone number is already registered.');
  }
  
  if (status === 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  if (status === 503) {
    throw new Error('Service temporarily unavailable. Please try again in a moment.');
  }
  
  // Default error message
  throw new Error(message || 'An unexpected error occurred. Please try again.');
};

// API helper functions
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  // Upload file (multipart/form-data)
  upload: async <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },
};

export default apiClient;
