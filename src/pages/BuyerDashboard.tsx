import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  MapPin,
  IndianRupee,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { inquiryService, Inquiry } from '../services/inquiryService';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'contacted':
      return <MessageSquare className="h-5 w-5 text-yellow-500" />;
    case 'interested':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'not-interested':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'closed':
      return <CheckCircle className="h-5 w-5 text-gray-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    'new': 'bg-blue-100 text-blue-700',
    'contacted': 'bg-yellow-100 text-yellow-700',
    'interested': 'bg-green-100 text-green-700',
    'not-interested': 'bg-red-100 text-red-700',
    'closed': 'bg-gray-100 text-gray-700'
  };
  
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
};

const getContactMethodIcon = (method: string) => {
  switch (method) {
    case 'call':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'whatsapp':
      return <MessageCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0
  });

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await inquiryService.getMyInquiries({
        status: filter !== 'all' ? filter : undefined,
        limit: 50
      });

      if (response.success) {
        setInquiries(response.data.inquiries);
        
        // Calculate stats
        const allInquiries = filter === 'all' ? response.data.inquiries : inquiries;
        setStats({
          total: response.data.pagination.total,
          new: allInquiries.filter((i: Inquiry) => i.status === 'new').length,
          contacted: allInquiries.filter((i: Inquiry) => i.status === 'contacted').length,
          interested: allInquiries.filter((i: Inquiry) => i.status === 'interested').length
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Track your property inquiries.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.new}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.contacted}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interested</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.interested}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'new', 'contacted', 'interested', 'not-interested', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && inquiries.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Inquiries Yet</h3>
            <p className="text-gray-600 mb-6">Start exploring properties and send your first inquiry!</p>
            <Link
              to="/properties"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* Inquiries List */}
        {!loading && !error && inquiries.length > 0 && (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="md:flex">
                  {/* Property Image */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={inquiry.property.images[0]?.url || '/placeholder-property.jpg'}
                      alt={inquiry.property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          to={`/property/${inquiry.property._id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition"
                        >
                          {inquiry.property.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{inquiry.property.address.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            <span>{formatPrice(inquiry.property.pricing.expectedPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>

                    {/* Inquiry Message */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Your Message:</span> {inquiry.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {getContactMethodIcon(inquiry.contactMethod)}
                        <span>Preferred: {inquiry.contactMethod.charAt(0).toUpperCase() + inquiry.contactMethod.slice(1)}</span>
                      </div>
                    </div>

                    {/* Owner Response */}
                    {inquiry.response && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-green-700">Owner's Response:</span> {inquiry.response}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Sent {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                        {inquiry.respondedAt && (
                          <span>• Responded {new Date(inquiry.respondedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Link
                        to={`/property/${inquiry.property._id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Property →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
