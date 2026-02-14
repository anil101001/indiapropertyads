import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
  register: (data: RegisterRequest) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
        
        // Fetch latest user data
        authService.getProfile()
          .then((response) => {
            if (response.success && response.data) {
              setUser({
                id: response.data._id,
                email: response.data.email,
                role: response.data.role,
                name: response.data.profile?.name || '',
                emailVerified: response.data.verification?.emailVerified || false,
                phone: response.data.phone,
                avatar: response.data.profile?.avatar,
              });
            }
          })
          .catch((error) => {
            console.error('Failed to fetch user profile:', error);
          });
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (response.data.user.role === 'agent') {
          navigate('/agent-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterRequest): Promise<{ needsVerification: boolean }> => {
    try {
      console.log('AuthContext: register called with:', data);
      const response = await authService.register(data);
      console.log('AuthContext: register response:', response);
      
      if (response.success) {
        // Registration successful, needs email verification
        return { needsVerification: true };
      }
      
      return { needsVerification: false };
    } catch (error: any) {
      console.error('AuthContext: register error:', error);
      // Pass through the error message from API layer (already formatted)
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const loginWithTokens = (accessToken: string, refreshToken: string) => {
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Decode user info from JWT payload (base64 middle segment)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userData: User = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.email.split('@')[0], // Temporary, will be updated from profile fetch
        emailVerified: true,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch full profile to get name, avatar, etc.
      authService.getProfile()
        .then((response) => {
          if (response.success && response.data) {
            const fullUser: User = {
              id: response.data._id,
              email: response.data.email,
              role: response.data.role,
              name: response.data.profile?.name || '',
              emailVerified: response.data.verification?.emailVerified || false,
              phone: response.data.phone,
              avatar: response.data.profile?.avatar,
            };
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
          }
        })
        .catch((err) => console.error('Failed to fetch profile after Google login:', err));
    } catch {
      console.error('Failed to decode JWT token');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithTokens,
    register,
    logout,
    isAuthenticated: !!user && authService.isAuthenticated(),
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
