import { useState, useEffect } from 'react';
import { X, DollarSign, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface BudgetPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function BudgetPreferencesModal({ isOpen, onClose, onSave }: BudgetPreferencesModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [budget, setBudget] = useState({
    min: '',
    max: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      // Fetch current user preferences
      fetchUserPreferences();
    }
  }, [isOpen, user]);

  const fetchUserPreferences = async () => {
    try {
      const response = await api.get('/users/me');
      // api.get returns the response body directly
      if (response.success && response.data.preferences?.budget) {
        setBudget({
          min: response.data.preferences.budget.min?.toString() || '',
          max: response.data.preferences.budget.max?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    const minVal = budget.min ? Number(budget.min) : 0;
    const maxVal = budget.max ? Number(budget.max) : 0;

    if (minVal < 0 || maxVal < 0) {
      setError('Budget values cannot be negative');
      setLoading(false);
      return;
    }

    if (budget.min && budget.max && minVal > maxVal) {
      setError('Minimum budget cannot be greater than maximum budget');
      setLoading(false);
      return;
    }

    try {
      const preferences = {
        budget: {
          min: budget.min ? Number(budget.min) : undefined,
          max: budget.max ? Number(budget.max) : undefined,
        },
      };

      await api.patch('/users/me', { preferences });
      setSuccess('Budget preferences saved successfully!');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Set Your Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Set your budget range to filter properties that match your affordability.
          </p>

          {/* Min Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g., 2000000"
              value={budget.min}
              onChange={(e) => setBudget({ ...budget, min: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {budget.min && `₹${Number(budget.min).toLocaleString('en-IN')}`}
            </p>
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g., 10000000"
              value={budget.max}
              onChange={(e) => setBudget({ ...budget, max: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {budget.max && `₹${Number(budget.max).toLocaleString('en-IN')}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Budget'}
          </button>
        </div>
      </div>
    </div>
  );
}
