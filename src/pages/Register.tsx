import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, User, Phone, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating your account...');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    agreeTerms: false,
  });

  const roles = [
    { id: 'buyer', label: 'Buyer/Renter', description: 'Looking for properties' },
    { id: 'owner', label: 'Property Owner', description: 'List your property' },
    { id: 'agent', label: 'Real Estate Agent', description: 'Manage listings & earn commissions' },
  ];

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter a valid 10-digit Indian phone number (starts with 6-9)';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Register form submitted:', formData);
    
    // Validate all fields
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      terms: !formData.agreeTerms ? 'You must accept the terms and conditions' : ''
    };

    setFieldErrors(errors);

    // Check if any errors
    if (Object.values(errors).some(err => err !== '')) {
      console.error('Validation failed:', errors);
      setError('Please fix all errors before submitting');
      return;
    }
    
    console.log('Validation passed, proceeding with registration');

    setLoading(true);
    setLoadingMessage('Creating your account...');
    
    // Show timeout warning after 10 seconds
    const timeoutWarning = setTimeout(() => {
      setLoadingMessage('Server is waking up, please wait...');
    }, 10000);
    
    const registerData = {
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role as 'buyer' | 'owner' | 'agent',
      profile: {
        name: formData.name,
      },
    };
    
    console.log('Sending registration data:', registerData);

    try {
      const result = await register(registerData);
      
      console.log('Registration result:', result);

      if (result.needsVerification) {
        setSuccess(true);
        // Redirect to OTP verification after 2 seconds
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      clearTimeout(timeoutWarning);
    } finally {
      setLoading(false);
      clearTimeout(timeoutWarning);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Building2 className="h-10 w-10 text-primary-600" />
          <span className="text-3xl font-bold text-gray-900">
            India<span className="text-primary-600">PropertyAds</span>
          </span>
        </Link>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join India's smartest real estate platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Account created! Check your email for verification code. Redirecting...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      formData.role === role.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 mb-1">{role.label}</p>
                    <p className="text-xs text-gray-600">{role.description}</p>
                    {formData.role === role.id && (
                      <CheckCircle className="h-5 w-5 text-primary-600 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name });
                    setFieldErrors({ ...fieldErrors, name: validateName(name) });
                  }}
                  onBlur={(e) => setFieldErrors({ ...fieldErrors, name: validateName(e.target.value) })}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-primary-500'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      const email = e.target.value;
                      setFormData({ ...formData, email });
                      setFieldErrors({ ...fieldErrors, email: validateEmail(email) });
                    }}
                    onBlur={(e) => setFieldErrors({ ...fieldErrors, email: validateEmail(e.target.value) })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const phone = e.target.value;
                      setFormData({ ...formData, phone });
                      setFieldErrors({ ...fieldErrors, phone: validatePhone(phone) });
                    }}
                    onBlur={(e) => setFieldErrors({ ...fieldErrors, phone: validatePhone(e.target.value) })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                      fieldErrors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => {
                      const password = e.target.value;
                      setFormData({ ...formData, password });
                      setFieldErrors({ 
                        ...fieldErrors, 
                        password: validatePassword(password),
                        confirmPassword: formData.confirmPassword ? validateConfirmPassword(password, formData.confirmPassword) : ''
                      });
                    }}
                    onBlur={(e) => setFieldErrors({ ...fieldErrors, password: validatePassword(e.target.value) })}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition ${
                      fieldErrors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2 text-xs space-y-1">
                  <p className="font-medium text-gray-700 mb-1.5">Password requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.password.length >= 8 ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*[a-z])/.test(formData.password) ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                      )}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*[A-Z])/.test(formData.password) ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                      )}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/(?=.*\d)/.test(formData.password) ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                      )}
                      <span>One number (0-9)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      const confirmPassword = e.target.value;
                      setFormData({ ...formData, confirmPassword });
                      setFieldErrors({ ...fieldErrors, confirmPassword: validateConfirmPassword(formData.password, confirmPassword) });
                    }}
                    onBlur={(e) => setFieldErrors({ ...fieldErrors, confirmPassword: validateConfirmPassword(formData.password, e.target.value) })}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition ${
                      fieldErrors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({ ...formData, agreeTerms: checked });
                    setFieldErrors({ ...fieldErrors, terms: checked ? '' : 'You must accept the terms and conditions' });
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {fieldErrors.terms && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 group disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{loadingMessage}</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Account Created!</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
