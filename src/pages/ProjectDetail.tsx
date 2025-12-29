import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, MapPin, Phone, Mail, Calendar, CheckCircle,
  Heart, Share2, Users, Eye, ArrowLeft,
  Home, Ruler, IndianRupee, Shield, Send
} from 'lucide-react';
import { projectService, Project, getConstructionStatusColor, getConstructionStatusLabel, getSegmentLabel, getProjectTypeLabel, formatPrice, formatArea } from '../services/builderService';
import { offerService, paymentPlanService, Offer, PaymentPlan, getOfferTypeLabel, getOfferTypeColor, getPlanTypeLabel, formatDiscount } from '../services/pricingService';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'amenities' | 'location' | 'plans'>('overview');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', phone: '', email: '', message: '', unitType: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getBySlug(slug!);
      setProject(data);

      // Fetch offers and payment plans
      if (data._id) {
        const [offersData, plansData] = await Promise.all([
          offerService.getPublicOffers(data._id).catch(() => []),
          paymentPlanService.getPublicPlans(data._id).catch(() => [])
        ]);
        setOffers(offersData);
        setPaymentPlans(plansData);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setInquiryLoading(true);
    try {
      await projectService.submitInquiry(project._id, inquiryData);
      setInquirySuccess(true);
      setInquiryData({ name: '', phone: '', email: '', message: '', unitType: '' });
      setTimeout(() => {
        setShowInquiryForm(false);
        setInquirySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setInquiryLoading(false);
    }
  };

  const getBuilderInfo = () => {
    if (!project) return { name: 'Builder', logo: null, verified: false };
    if (typeof project.builder === 'string') {
      return { name: 'Builder', logo: null, verified: false };
    }
    return {
      name: project.builder.brandName || project.builder.companyName,
      logo: project.builder.logo,
      verified: project.builder.verification?.status === 'verified'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700">
            Browse All Projects
          </Link>
        </div>
      </div>
    );
  }

  const builder = getBuilderInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900">
        {project.media.images[0] ? (
          <img
            src={project.media.images[0].url}
            alt={project.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/projects" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConstructionStatusColor(project.construction.status)}`}>
                    {getConstructionStatusLabel(project.construction.status)}
                  </span>
                  {project.isFeatured && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.name}</h1>
                {project.tagline && (
                  <p className="text-white/80 text-lg mb-2">{project.tagline}</p>
                )}
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  {project.location.locality}, {project.location.city}, {project.location.state}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition">
                  <Heart className="h-5 w-5 text-white" />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition">
                  <Share2 className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition font-medium"
                >
                  Get Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Home className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{project.details.totalUnits}</p>
                  <p className="text-sm text-gray-500">Total Units</p>
                </div>
                <div className="text-center">
                  <Ruler className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatArea(project.details.sizeRange.min)} - {formatArea(project.details.sizeRange.max)}
                  </p>
                  <p className="text-sm text-gray-500">Size Range</p>
                </div>
                <div className="text-center">
                  <IndianRupee className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(project.details.priceRange.min)}
                  </p>
                  <p className="text-sm text-gray-500">Starting From</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {project.construction.expectedCompletion 
                      ? new Date(project.construction.expectedCompletion).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                      : 'Ready'}
                  </p>
                  <p className="text-sm text-gray-500">Possession</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow">
              <div className="border-b">
                <nav className="flex overflow-x-auto">
                  {['overview', 'units', 'amenities', 'location', 'plans'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                        activeTab === tab
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About {project.name}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Project Type</p>
                        <p className="font-semibold">{getProjectTypeLabel(project.projectType)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Segment</p>
                        <p className="font-semibold">{getSegmentLabel(project.segment)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Area</p>
                        <p className="font-semibold">{project.details.totalArea} Acres</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Towers/Blocks</p>
                        <p className="font-semibold">{project.details.totalTowers || 'N/A'}</p>
                      </div>
                    </div>

                    {/* RERA Info */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">RERA Registered</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Registration No: {project.approvals.rera.registrationNumber}
                      </p>
                      <p className="text-sm text-green-600">
                        Valid Until: {new Date(project.approvals.rera.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Units Tab */}
                {activeTab === 'units' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Available Unit Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.details.unitTypes.map((type, i) => (
                        <div key={i} className="p-4 border rounded-lg hover:shadow-md transition">
                          <h4 className="font-semibold text-gray-900 mb-2">{type}</h4>
                          <button
                            onClick={() => {
                              setInquiryData({ ...inquiryData, unitType: type });
                              setShowInquiryForm(true);
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Enquire Now →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities Tab */}
                {activeTab === 'amenities' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Project Amenities</h3>
                    {project.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {project.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Amenities information coming soon</p>
                    )}
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{project.location.fullAddress}</p>
                      <p className="text-gray-600 mt-1">
                        {project.location.locality}, {project.location.city}, {project.location.state} - {project.location.pincode}
                      </p>
                      {project.location.landmark && (
                        <p className="text-gray-500 mt-1">Landmark: {project.location.landmark}</p>
                      )}
                    </div>
                    
                    {/* Map placeholder */}
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map View Coming Soon</p>
                    </div>
                  </div>
                )}

                {/* Payment Plans Tab */}
                {activeTab === 'plans' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Plans</h3>
                    {paymentPlans.length > 0 ? (
                      <div className="space-y-4">
                        {paymentPlans.map(plan => (
                          <div key={plan._id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                              {plan.display.isRecommended && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-primary-600 mb-2">{getPlanTypeLabel(plan.planType)}</p>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                            
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm">
                                <span className="text-gray-500">Booking Amount: </span>
                                <span className="font-semibold">
                                  {plan.bookingAmount.type === 'percentage' 
                                    ? `${plan.bookingAmount.value}%` 
                                    : formatPrice(plan.bookingAmount.value)}
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {plan.milestones.length} payment milestones
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Payment plan details available on request</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Offers */}
            {offers.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map(offer => (
                    <div key={offer._id} className="p-4 border-2 border-dashed border-green-300 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOfferTypeColor(offer.offerType)}`}>
                          {getOfferTypeLabel(offer.offerType)}
                        </span>
                        {offer.display.highlightBadge && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            {offer.display.highlightBadge}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">{offer.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        {formatDiscount(offer.discount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Valid till {new Date(offer.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow p-6 sticky top-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Price Range</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(project.details.priceRange.min)} - {formatPrice(project.details.priceRange.max)}
                </p>
              </div>

              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium mb-3"
              >
                Get Price Breakup
              </button>

              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition font-medium"
              >
                Schedule Site Visit
              </button>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  {project.stats.views} views
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Users className="h-4 w-4" />
                  {project.stats.inquiries} inquiries
                </div>
              </div>
            </div>

            {/* Builder Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Developer</h3>
              <div className="flex items-center gap-3 mb-4">
                {builder.logo ? (
                  <img src={builder.logo} alt={builder.name} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="h-12 w-12 bg-primary-100 rounded flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{builder.name}</p>
                  {builder.verified && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified Builder
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                to={`/builders/${typeof project.builder === 'string' ? project.builder : project.builder._id}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All Projects by {builder.name} →
              </Link>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <a href="tel:+919999999999" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                  <Phone className="h-5 w-5" />
                  <span>+91 99999 99999</span>
                </a>
                <a href="mailto:info@example.com" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                  <Mail className="h-5 w-5" />
                  <span>info@example.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Enquire About {project.name}</h2>
            </div>

            {inquirySuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={inquiryData.email}
                    onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {inquiryData.unitType && (
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-700">
                      Interested in: <strong>{inquiryData.unitType}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="I'm interested in this project..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inquiryLoading || !inquiryData.name || !inquiryData.phone}
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {inquiryLoading ? 'Sending...' : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
