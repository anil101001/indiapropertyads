import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShieldCheck,
  Globe,
  Lock,
  Home,
  Building2,
  Briefcase,
  Crown,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
  MessageSquare,
  IndianRupee,
  Tag,
  Clock,
  TrendingUp,
  Users,
  Heart,
} from 'lucide-react';
import { api } from '../services/api';

interface UserDetail {
  _id: string;
  email: string;
  phone?: string;
  googleId?: string;
  authProvider: string;
  profileComplete: boolean;
  role: string;
  isActive: boolean;
  profile: {
    name: string;
    avatar?: string;
    location?: { city?: string; state?: string; pincode?: string };
  };
  preferences?: {
    budget?: { min?: number; max?: number };
    propertyTypes?: string[];
    preferredCities?: string[];
  };
  verification: { emailVerified: boolean; phoneVerified: boolean; kycStatus?: string };
  subscription?: { plan: string; validUntil?: string; autoRenew: boolean };
  stats?: {
    propertiesListed: number;
    propertiesSold: number;
    totalCommission: number;
    rating?: number;
    reviewCount: number;
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface InquiryItem {
  _id: string;
  property?: { _id: string; title: string; location?: { city?: string; state?: string }; price?: number; propertyType?: string; images?: string[] };
  buyer?: { profile?: { name: string }; email?: string; phone?: string };
  buyerInfo?: { name: string; email: string; phone: string };
  message: string;
  status: string;
  contactMethod: string;
  priority?: string;
  createdAt: string;
}

interface PropertyItem {
  _id: string;
  title: string;
  location?: { city?: string; state?: string };
  price?: number;
  propertyType?: string;
  listingType?: string;
  status?: string;
  images?: string[];
  views?: number;
  createdAt: string;
}

interface ActivityData {
  inquiriesAsBuyer: InquiryItem[];
  inquiriesAsOwner: InquiryItem[];
  propertiesListed: PropertyItem[];
  propertiesCount: number;
  recentInquiries: InquiryItem[];
  inquiryStats: {
    totalSent: number;
    totalReceived: number;
    statusBreakdown: Record<string, number>;
  };
}

const roleConfig: Record<string, { icon: any; color: string; label: string }> = {
  buyer: { icon: Home, color: 'bg-blue-100 text-blue-700', label: 'Buyer' },
  owner: { icon: Building2, color: 'bg-green-100 text-green-700', label: 'Owner / Seller' },
  agent: { icon: Briefcase, color: 'bg-purple-100 text-purple-700', label: 'Agent' },
  admin: { icon: Crown, color: 'bg-red-100 text-red-700', label: 'Admin' },
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  interested: 'bg-green-100 text-green-700',
  'site-visit': 'bg-purple-100 text-purple-700',
  negotiation: 'bg-orange-100 text-orange-700',
  'closed-won': 'bg-emerald-100 text-emerald-700',
  'closed-lost': 'bg-red-100 text-red-700',
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res: any = await api.get(`/admin/users/${id}`);
        if (res.success) {
          setUser(res.data.user);
          setActivity(res.data.activity);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (p?: number) => {
    if (!p) return '—';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${p.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/admin-cockpit')} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            Back to Cockpit
          </button>
        </div>
      </div>
    );
  }

  const rc = roleConfig[user.role] || roleConfig.buyer;
  const RoleIcon = rc.icon;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(user.role === 'buyer' || user.role === 'admin' ? [{ key: 'inquiries-sent', label: `Inquiries Sent (${activity?.inquiryStats.totalSent || 0})` }] : []),
    ...(user.role === 'owner' || user.role === 'agent' || user.role === 'admin' ? [
      { key: 'properties', label: `Properties (${activity?.propertiesCount || 0})` },
      { key: 'inquiries-received', label: `Inquiries Received (${activity?.inquiryStats.totalReceived || 0})` },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button onClick={() => navigate('/admin-cockpit')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Admin Cockpit</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-32 relative" />
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              {/* Avatar */}
              {user.profile.avatar ? (
                <img src={user.profile.avatar} alt="" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-3xl">{user.profile.name?.charAt(0)?.toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{user.profile.name}</h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${rc.color}`}>
                    <RoleIcon className="h-3.5 w-3.5" />
                    {rc.label}
                  </span>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <XCircle className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                  {user.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.phone}</span>}
                  {user.profile.location?.city && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.profile.location.city}, {user.profile.location.state}</span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-gray-400 space-y-1">
                <p>Joined: {formatDate(user.createdAt)}</p>
                <p>Last login: {formatDate(user.lastLoginAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Shield className="h-4 w-4" /> Account</h3>
            <div className="space-y-2 text-sm">
              <Row label="Auth Provider" value={
                <span className={`inline-flex items-center gap-1 ${user.authProvider === 'google' ? 'text-orange-600' : 'text-gray-700'}`}>
                  {user.authProvider === 'google' ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {user.authProvider}
                </span>
              } />
              <Row label="Email Verified" value={
                user.verification.emailVerified
                  ? <span className="text-green-600 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Yes</span>
                  : <span className="text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
              } />
              <Row label="Profile Complete" value={user.profileComplete ? 'Yes' : 'No'} />
              <Row label="KYC Status" value={user.verification.kycStatus || 'N/A'} />
              <Row label="User ID" value={<span className="font-mono text-xs text-gray-400">{user._id}</span>} />
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Tag className="h-4 w-4" /> Subscription</h3>
            <div className="space-y-2 text-sm">
              <Row label="Plan" value={
                <span className="capitalize font-medium">{user.subscription?.plan || 'free'}</span>
              } />
              <Row label="Valid Until" value={user.subscription?.validUntil ? formatDate(user.subscription.validUntil) : 'N/A'} />
              <Row label="Auto Renew" value={user.subscription?.autoRenew ? 'Yes' : 'No'} />
            </div>

            {/* Preferences (for buyers) */}
            {user.preferences && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-3 flex items-center gap-2"><Heart className="h-4 w-4" /> Preferences</h3>
                <div className="space-y-2 text-sm">
                  {user.preferences.budget && (
                    <Row label="Budget" value={`${formatPrice(user.preferences.budget.min)} - ${formatPrice(user.preferences.budget.max)}`} />
                  )}
                  {user.preferences.propertyTypes && user.preferences.propertyTypes.length > 0 && (
                    <Row label="Property Types" value={
                      <div className="flex flex-wrap gap-1">
                        {user.preferences.propertyTypes.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t}</span>
                        ))}
                      </div>
                    } />
                  )}
                  {user.preferences.preferredCities && user.preferences.preferredCities.length > 0 && (
                    <Row label="Preferred Cities" value={
                      <div className="flex flex-wrap gap-1">
                        {user.preferences.preferredCities.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{c}</span>
                        ))}
                      </div>
                    } />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Activity Summary</h3>
            <div className="space-y-2 text-sm">
              <Row label="Inquiries Sent" value={activity?.inquiryStats.totalSent || 0} />
              <Row label="Inquiries Received" value={activity?.inquiryStats.totalReceived || 0} />
              <Row label="Properties Listed" value={activity?.propertiesCount || 0} />
              {user.stats && (
                <>
                  <Row label="Properties Sold" value={user.stats.propertiesSold} />
                  <Row label="Total Commission" value={formatPrice(user.stats.totalCommission)} />
                  {user.stats.rating && <Row label="Rating" value={`${user.stats.rating} / 5 (${user.stats.reviewCount} reviews)`} />}
                </>
              )}
            </div>

            {/* Inquiry Pipeline */}
            {activity && activity.inquiryStats.totalReceived > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 mt-5 mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Lead Pipeline</h3>
                <div className="space-y-1">
                  {Object.entries(activity.inquiryStats.statusBreakdown).filter(([, v]) => v > 0).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
                      <span className="text-xs font-bold text-gray-700">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {activity?.recentInquiries && activity.recentInquiries.length > 0 ? (
                  <div className="space-y-3">
                    {activity.recentInquiries.map((inq) => (
                      <div key={inq._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{inq.property?.title || 'Property'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{inq.property?.location?.city} • {formatPrice(inq.property?.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[inq.status] || 'bg-gray-100 text-gray-700'}`}>{inq.status}</span>
                            <span className="text-xs text-gray-400">{inq.contactMethod}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(inq.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                )}
              </div>
            )}

            {activeTab === 'inquiries-sent' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiries Sent by This User</h3>
                {activity?.inquiriesAsBuyer && activity.inquiriesAsBuyer.length > 0 ? (
                  <div className="space-y-3">
                    {activity.inquiriesAsBuyer.map((inq) => (
                      <InquiryCard key={inq._id} inquiry={inq} type="sent" formatDate={formatDate} formatPrice={formatPrice} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No inquiries sent.</p>
                )}
              </div>
            )}

            {activeTab === 'properties' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties Listed</h3>
                {activity?.propertiesListed && activity.propertiesListed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activity.propertiesListed.map((prop) => (
                      <div key={prop._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex gap-3">
                          {prop.images && prop.images[0] ? (
                            <img src={prop.images[0]} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{prop.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{prop.location?.city}, {prop.location?.state}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-sm font-bold text-primary-600">{formatPrice(prop.price)}</span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{prop.propertyType}</span>
                              {prop.listingType && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{prop.listingType}</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{prop.views || 0} views</span>
                              <span className={`px-2 py-0.5 rounded font-medium ${prop.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{prop.status}</span>
                              <span>{formatDate(prop.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No properties listed.</p>
                )}
              </div>
            )}

            {activeTab === 'inquiries-received' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiries Received</h3>
                {activity?.inquiriesAsOwner && activity.inquiriesAsOwner.length > 0 ? (
                  <div className="space-y-3">
                    {activity.inquiriesAsOwner.map((inq) => (
                      <InquiryCard key={inq._id} inquiry={inq} type="received" formatDate={formatDate} formatPrice={formatPrice} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No inquiries received.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-900 text-xs font-medium text-right">{value}</span>
    </div>
  );
}

function InquiryCard({ inquiry, type, formatDate, formatPrice }: { inquiry: any; type: 'sent' | 'received'; formatDate: (d: string) => string; formatPrice: (p?: number) => string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
          <MessageSquare className="h-4 w-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-gray-900 text-sm truncate">{inquiry.property?.title || 'Property'}</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'}`}>{inquiry.status}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {inquiry.property?.location?.city} • {formatPrice(inquiry.property?.price)}
          </p>
          {type === 'received' && inquiry.buyerInfo && (
            <p className="text-xs text-gray-600 mt-1">
              From: <span className="font-medium">{inquiry.buyerInfo.name}</span> ({inquiry.buyerInfo.email})
            </p>
          )}
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{inquiry.message}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{inquiry.contactMethod}</span>
            {inquiry.priority && <span className={`px-2 py-0.5 rounded font-medium ${inquiry.priority === 'urgent' ? 'bg-red-50 text-red-600' : inquiry.priority === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>{inquiry.priority}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(inquiry.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
