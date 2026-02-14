import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleSelectionModal from '../components/RoleSelectionModal';

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (!accessToken || !refreshToken) {
      setError('Authentication failed. No tokens received from Google.');
      return;
    }

    if (isNewUser) {
      // New user — must select role before proceeding
      setTokens({ accessToken, refreshToken });
      setShowRoleSelection(true);
    } else {
      // Existing user — log them in directly
      loginWithTokens(accessToken, refreshToken);
      navigate('/', { replace: true });
    }
  }, [searchParams, loginWithTokens, navigate]);

  const handleRoleSelected = () => {
    // After role selection, the modal calls complete-profile API and updates auth
    // Navigate to home
    navigate('/', { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign-in Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (showRoleSelection && tokens) {
    return (
      <RoleSelectionModal
        accessToken={tokens.accessToken}
        refreshToken={tokens.refreshToken}
        onComplete={handleRoleSelected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Signing you in with Google...</p>
      </div>
    </div>
  );
}
