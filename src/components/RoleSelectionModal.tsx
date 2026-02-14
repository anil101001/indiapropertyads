import { useState } from 'react';
import { Home, Building2, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface RoleSelectionModalProps {
  accessToken: string;
  refreshToken: string;
  onComplete: () => void;
}

const roles = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'I want to buy or rent a property',
    icon: Home,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700',
    selectedColor: 'bg-blue-100 border-blue-500 ring-2 ring-blue-300',
  },
  {
    value: 'owner',
    label: 'Owner / Seller',
    description: 'I want to sell or rent out my property',
    icon: Building2,
    color: 'bg-green-50 border-green-200 hover:border-green-400 text-green-700',
    selectedColor: 'bg-green-100 border-green-500 ring-2 ring-green-300',
  },
  {
    value: 'agent',
    label: 'Agent / Builder',
    description: 'I am a real estate agent or builder',
    icon: Users,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-700',
    selectedColor: 'bg-purple-100 border-purple-500 ring-2 ring-purple-300',
  },
];

export default function RoleSelectionModal({ accessToken, refreshToken: _refreshToken, onComplete }: RoleSelectionModalProps) {
  const { loginWithTokens } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, set the tokens so the API call is authenticated
      localStorage.setItem('accessToken', accessToken);

      // Call complete-profile endpoint
      const response = await api.patch('/auth/complete-profile', {
        role: selectedRole,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.success) {
        // Use the new tokens from the response (they have the updated role)
        const newAccessToken = response.data.tokens.accessToken;
        const newRefreshToken = response.data.tokens.refreshToken;
        loginWithTokens(newAccessToken, newRefreshToken);
        onComplete();
      } else {
        setError(response.message || 'Failed to set role');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome to India Property Ads!</h1>
          <p className="text-primary-100 mt-2">One last step — tell us what brings you here</p>
        </div>

        {/* Role Selection */}
        <div className="p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">I am a... <span className="text-red-500">*</span></p>

          <div className="space-y-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => { setSelectedRole(role.value); setError(''); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected ? role.selectedColor : role.color
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-white/70'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{role.label}</p>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
              selectedRole && !loading
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Continue'
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500 text-center">
            You can change your role later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
