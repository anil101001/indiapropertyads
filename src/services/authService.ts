import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone: string;
  role: 'buyer' | 'owner' | 'agent';
  profile: {
    name: string;
    location?: {
      city: string;
      state: string;
    };
  };
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      name: string;
      emailVerified: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  message: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  emailVerified: boolean;
  phone?: string;
  avatar?: string;
}

class AuthService {
  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response;
  }

  // Verify email with OTP
  async verifyEmail(data: VerifyEmailRequest): Promise<any> {
    const response = await api.post('/auth/verify-email', data);
    return response;
  }

  // Resend OTP
  async resendOTP(email: string): Promise<any> {
    const response = await api.post('/auth/resend-otp', { email });
    return response;
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.success && response.data) {
      // Store tokens and user in localStorage
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Forgot password
  async forgotPassword(email: string): Promise<any> {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  }

  // Get user profile
  async getProfile(): Promise<any> {
    const response = await api.get('/users/me');
    if (response.success && response.data) {
      // Update stored user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ...response.data,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    return response;
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<any> {
    const response = await api.patch('/users/me', data);
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  }
}

export const authService = new AuthService();
