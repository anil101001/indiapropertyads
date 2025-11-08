import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Clock, 
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Home
} from 'lucide-react';
import { inquiryService, Inquiry } from '../services/inquiryService';
import { propertyService, Property } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
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

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'inquiries' | 'properties'>('inquiries');
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    totalProperties: 0,
    totalViews: 0
  });
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch inquiries
      const inquiriesResponse = await inquiryService.getReceivedInquiries({
        status: filter !== 'all' ? filter : undefined,
        limit: 50
      });

      // Fetch properties
      const propertiesResponse = await propertyService.getProperties({
        limit: 50
      });

      if (inquiriesResponse.success && propertiesResponse.success) {
        setInquiries(inquiriesResponse.data.inquiries);
        setProperties(propertiesResponse.data.properties);

        // Calculate stats
        const totalViews = propertiesResponse.data.properties.reduce(
          (sum: number, prop: Property) => sum + prop.stats.views,
          0
        );

        setStats({
          totalInquiries: inquiriesResponse.data.pagination.total,
          newInquiries: inquiriesResponse.data.inquiries.filter((i: Inquiry) => i.status === 'new').length,
          totalProperties: propertiesResponse.data.pagination.total,
          totalViews
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiry = async (inquiryId: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      if (responseText.trim()) {
        updateData.response = responseText;
      }

      await inquiryService.updateInquiry(inquiryId, updateData);
      
      // Refresh inquiries
      await fetchDashboardData();
      setSelectedInquiry(null);
      setResponseText('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'agent' ? 'Agent' : 'Owner'} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your properties and inquiries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.newInquiries}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProperties}</p>
              </div>
              <Home className="h-10 w-10 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews}</p>
              </div>
              <Eye className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'inquiries'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Inquiries ({stats.totalInquiries})
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'properties'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Properties ({stats.totalProperties})
          </button>
        </div>

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <>
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
                <p className="text-gray-600">You'll see inquiries from interested buyers here.</p>
              </div>
            )}

            {/* Inquiries List */}
            {!loading && !error && inquiries.length > 0 && (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry._id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          to={`/property/${inquiry.property._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition"
                        >
                          {inquiry.property.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{inquiry.property.address.city}</span>
                          <span>•</span>
                          <span>{formatPrice(inquiry.property.pricing.expectedPrice)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>

                    {/* Buyer Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-gray-900 mb-2">From: {inquiry.buyerInfo.name}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <a href={`tel:${inquiry.buyerInfo.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                          <Phone className="h-4 w-4" />
                          {inquiry.buyerInfo.phone}
                        </a>
                        <a href={`mailto:${inquiry.buyerInfo.email}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                          <Mail className="h-4 w-4" />
                          {inquiry.buyerInfo.email}
                        </a>
                        <a 
                          href={`https://wa.me/91${inquiry.buyerInfo.phone.replace(/\D/g, '')}?text=Hi ${inquiry.buyerInfo.name}, regarding ${inquiry.property.title}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 hover:text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Message:</span> {inquiry.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Sent on {new Date(inquiry.createdAt).toLocaleString()} • Preferred: {inquiry.contactMethod}
                      </p>
                    </div>

                    {/* Response Section */}
                    {selectedInquiry?._id === inquiry._id ? (
                      <div className="border-t pt-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response here..."
                          rows={3}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateInquiry(inquiry._id, 'contacted')}
                            disabled={updating}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Mark Contacted'}
                          </button>
                          <button
                            onClick={() => handleUpdateInquiry(inquiry._id, 'interested')}
                            disabled={updating}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Mark Interested'}
                          </button>
                          <button
                            onClick={() => handleUpdateInquiry(inquiry._id, 'not-interested')}
                            disabled={updating}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Not Interested'}
                          </button>
                          <button
                            onClick={() => setSelectedInquiry(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {inquiry.response && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-green-700">Your Response:</span> {inquiry.response}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Responded on {new Date(inquiry.respondedAt || inquiry.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {inquiry.status === 'new' && (
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                          >
                            Respond to Inquiry
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Properties</h2>
              <Link
                to="/my-properties"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Manage Properties
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <Link
                  key={property._id}
                  to={`/property/${property._id}`}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={property.images[0]?.url || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                    <p className="text-primary-600 font-bold mb-2">{formatPrice(property.pricing.expectedPrice)}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {property.stats.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {property.stats.inquiries} inquiries
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
