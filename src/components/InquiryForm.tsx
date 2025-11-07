import { useState } from 'react';
import { Phone, Mail, MessageCircle, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { inquiryService } from '../services/inquiryService';
import { useAuth } from '../context/AuthContext';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

export default function InquiryForm({ propertyId, propertyTitle, onSuccess }: InquiryFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    message: '',
    contactMethod: 'call' as 'call' | 'email' | 'whatsapp'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to send an inquiry');
      return;
    }

    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await inquiryService.createInquiry({
        propertyId,
        message: formData.message,
        contactMethod: formData.contactMethod
      });

      setSuccess(true);
      setFormData({ message: '', contactMethod: 'call' });
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-gray-700 mb-4">Please login to contact the property owner</p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Login to Continue
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiry Sent Successfully!</h3>
        <p className="text-gray-600">
          The property owner will contact you soon via your preferred method.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Property Owner</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            placeholder={`I'm interested in "${propertyTitle}". Please contact me with more details.`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 characters (min 10)
          </p>
        </div>

        {/* Contact Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Contact Method *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, contactMethod: 'call' })}
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition ${
                formData.contactMethod === 'call'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Phone className="h-6 w-6" />
              <span className="text-sm font-medium">Call</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, contactMethod: 'email' })}
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition ${
                formData.contactMethod === 'email'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mail className="h-6 w-6" />
              <span className="text-sm font-medium">Email</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, contactMethod: 'whatsapp' })}
              className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition ${
                formData.contactMethod === 'whatsapp'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || formData.message.trim().length < 10}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send Inquiry</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By sending this inquiry, you agree to be contacted by the property owner.
        </p>
      </form>
    </div>
  );
}
