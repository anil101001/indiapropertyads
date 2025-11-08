import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    pastedData.split('').forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Auto-submit if complete
    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpValue: string) => {
    setError('');
    setLoading(true);

    try {
      await authService.verifyEmail({ email, otp: otpValue });
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
      setOtp(['', '', '', '', '', '']); // Clear OTP
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      await authService.resendOTP(email);
      setTimeLeft(600); // Reset timer
      setOtp(['', '', '', '', '', '']); // Clear OTP
      document.getElementById('otp-0')?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting to login...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-primary-600">🏠 India Property Ads</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Verifying...</span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
              <Mail className="h-4 w-4" />
              <span>
                {timeLeft > 0 ? (
                  <>Code expires in <strong>{formatTime(timeLeft)}</strong></>
                ) : (
                  <span className="text-red-600">Code expired</span>
                )}
              </span>
            </div>

            <button
              onClick={handleResendOTP}
              disabled={resending || timeLeft > 540} // Allow resend after 1 minute
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending...' : timeLeft > 540 ? `Resend in ${formatTime(timeLeft - 540)}` : 'Resend Code'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">Didn't receive the code?</p>
            <p>Check your spam folder or try resending</p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Wrong email?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register again
          </Link>
        </div>
      </div>
    </div>
  );
}
