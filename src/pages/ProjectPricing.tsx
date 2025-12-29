import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, DollarSign, Tag, Calendar,
  AlertCircle, Trash2, Edit, CheckCircle
} from 'lucide-react';
import {
  pricingRuleService, offerService, paymentPlanService,
  PricingRule, Offer, PaymentPlan,
  getOfferTypeLabel, getOfferTypeColor, getOfferStatusColor,
  getPlanTypeLabel, formatPrice, formatDiscount
} from '../services/pricingService';

type TabType = 'pricing' | 'offers' | 'payment-plans';

export default function ProjectPricing() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pricing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);

  const [showAddPricing, setShowAddPricing] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'pricing') {
        const rules = await pricingRuleService.getProjectRules(projectId!);
        setPricingRules(rules);
      } else if (activeTab === 'offers') {
        const offerList = await offerService.getProjectOffers(projectId!);
        setOffers(offerList);
      } else {
        const plans = await paymentPlanService.getProjectPlans(projectId!);
        setPaymentPlans(plans);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePricingRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    try {
      await pricingRuleService.delete(ruleId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await offerService.delete(offerId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this payment plan?')) return;
    try {
      await paymentPlanService.delete(planId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/builder/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pricing & Offers</h1>
              <p className="text-gray-500">Manage pricing rules, offers, and payment plans</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'pricing'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <DollarSign className="h-4 w-4 inline mr-2" />
                Pricing Rules
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'offers'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Tag className="h-4 w-4 inline mr-2" />
                Offers & Discounts
              </button>
              <button
                onClick={() => setActiveTab('payment-plans')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'payment-plans'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Payment Plans
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Pricing Rules Tab */}
                {activeTab === 'pricing' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Pricing Rules</h2>
                      <button
                        onClick={() => setShowAddPricing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Pricing Rule
                      </button>
                    </div>

                    {pricingRules.length === 0 ? (
                      <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pricing Rules</h3>
                        <p className="text-gray-500 mb-4">Create pricing rules to set base prices and premiums</p>
                        <button
                          onClick={() => setShowAddPricing(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                          Create First Rule
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pricingRules.map(rule => (
                          <div key={rule._id} className="border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                                  {rule.isActive && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Active</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded">
                                  <Edit className="h-4 w-4 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => handleDeletePricingRule(rule._id)}
                                  className="p-2 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-xs text-gray-500">Base Price</p>
                                <p className="font-semibold">₹{rule.basePricing.pricePerSqft.toLocaleString()}/sqft</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Floor Rise</p>
                                <p className="font-semibold">
                                  {rule.floorRise.enabled
                                    ? `₹${rule.floorRise.value}/sqft/floor`
                                    : 'Disabled'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Facing Premium</p>
                                <p className="font-semibold">
                                  {rule.facingPremium.enabled
                                    ? `${rule.facingPremium.premiums.length} facings`
                                    : 'Disabled'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">GST</p>
                                <p className="font-semibold">{rule.governmentCharges.gstPercentage}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Offers Tab */}
                {activeTab === 'offers' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Offers & Discounts</h2>
                      <button
                        onClick={() => setShowAddOffer(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Create Offer
                      </button>
                    </div>

                    {offers.length === 0 ? (
                      <div className="text-center py-12">
                        <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offers</h3>
                        <p className="text-gray-500 mb-4">Create offers to attract more buyers</p>
                        <button
                          onClick={() => setShowAddOffer(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                          Create First Offer
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offers.map(offer => (
                          <div key={offer._id} className="border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOfferTypeColor(offer.offerType)}`}>
                                    {getOfferTypeLabel(offer.offerType)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOfferStatusColor(offer.status)}`}>
                                    {offer.status}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                              </div>
                              <button
                                onClick={() => handleDeleteOffer(offer._id)}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{offer.description}</p>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="text-lg font-bold text-green-600">
                                {formatDiscount(offer.discount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Valid till {new Date(offer.validUntil).toLocaleDateString()}
                              </div>
                            </div>

                            {offer.code && (
                              <div className="mt-3 p-2 bg-gray-100 rounded text-center">
                                <span className="text-xs text-gray-500">Code: </span>
                                <span className="font-mono font-bold">{offer.code}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Plans Tab */}
                {activeTab === 'payment-plans' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Payment Plans</h2>
                      <button
                        onClick={() => setShowAddPlan(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Payment Plan
                      </button>
                    </div>

                    {paymentPlans.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Plans</h3>
                        <p className="text-gray-500 mb-4">Create payment plans for flexible payment options</p>
                        <button
                          onClick={() => setShowAddPlan(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                          Create First Plan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paymentPlans.map(plan => (
                          <div key={plan._id} className="border rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                  {plan.display.isRecommended && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-primary-600">{getPlanTypeLabel(plan.planType)}</span>
                              </div>
                              <button
                                onClick={() => handleDeletePlan(plan._id)}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">{plan.description}</p>

                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-xs text-gray-500">Booking Amount</p>
                                <p className="font-semibold">
                                  {plan.bookingAmount.type === 'percentage'
                                    ? `${plan.bookingAmount.value}%`
                                    : formatPrice(plan.bookingAmount.value)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Milestones</p>
                                <p className="font-semibold">{plan.milestones.length} stages</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Benefits</p>
                                <p className="font-semibold">{plan.benefits.length} benefits</p>
                              </div>
                            </div>

                            {plan.benefits.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {plan.benefits.slice(0, 3).map((benefit, i) => (
                                  <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    {benefit.description}
                                  </span>
                                ))}
                                {plan.benefits.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                    +{plan.benefits.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add Pricing Rule Modal */}
        {showAddPricing && (
          <AddPricingRuleModal
            projectId={projectId!}
            onClose={() => setShowAddPricing(false)}
            onSuccess={() => { setShowAddPricing(false); fetchData(); }}
          />
        )}

        {/* Add Offer Modal */}
        {showAddOffer && (
          <AddOfferModal
            projectId={projectId!}
            onClose={() => setShowAddOffer(false)}
            onSuccess={() => { setShowAddOffer(false); fetchData(); }}
          />
        )}

        {/* Add Payment Plan Modal */}
        {showAddPlan && (
          <AddPaymentPlanModal
            projectId={projectId!}
            onClose={() => setShowAddPlan(false)}
            onSuccess={() => { setShowAddPlan(false); fetchData(); }}
          />
        )}
      </div>
    </div>
  );
}

// Add Pricing Rule Modal
function AddPricingRuleModal({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerSqft: 5000,
    floorRiseEnabled: false,
    floorRiseValue: 50,
    stampDuty: 5,
    registration: 1,
    gst: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await pricingRuleService.create(projectId, {
        name: formData.name,
        description: formData.description,
        basePricing: { pricePerSqft: formData.pricePerSqft, currency: 'INR' },
        floorRise: {
          enabled: formData.floorRiseEnabled,
          type: 'fixed',
          value: formData.floorRiseValue,
          startFromFloor: 1
        },
        governmentCharges: {
          stampDutyPercentage: formData.stampDuty,
          registrationPercentage: formData.registration,
          gstPercentage: formData.gst
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create pricing rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Add Pricing Rule</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Standard Pricing 2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹/sqft) *</label>
            <input
              type="number"
              value={formData.pricePerSqft}
              onChange={(e) => setFormData({ ...formData, pricePerSqft: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="100"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="floorRise"
              checked={formData.floorRiseEnabled}
              onChange={(e) => setFormData({ ...formData, floorRiseEnabled: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="floorRise" className="text-sm text-gray-700">Enable Floor Rise</label>
            {formData.floorRiseEnabled && (
              <input
                type="number"
                value={formData.floorRiseValue}
                onChange={(e) => setFormData({ ...formData, floorRiseValue: Number(e.target.value) })}
                className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                placeholder="₹/sqft/floor"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stamp Duty %</label>
              <input
                type="number"
                value={formData.stampDuty}
                onChange={(e) => setFormData({ ...formData, stampDuty: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration %</label>
              <input
                type="number"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
              <input
                type="number"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !formData.name} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Offer Modal
function AddOfferModal({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offerType: 'discount' as const,
    discountType: 'percentage' as const,
    discountValue: 5,
    code: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await offerService.create(projectId, {
        name: formData.name,
        description: formData.description,
        offerType: formData.offerType,
        discount: { type: formData.discountType, value: formData.discountValue },
        code: formData.code || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        status: 'active'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Create Offer</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., New Year Special"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
              <select
                value={formData.offerType}
                onChange={(e) => setFormData({ ...formData, offerType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="discount">Discount</option>
                <option value="cashback">Cashback</option>
                <option value="gift">Free Gift</option>
                <option value="waiver">Waiver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono"
                placeholder="NEWYEAR24"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="per-sqft">Per Sqft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !formData.name || !formData.description} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Payment Plan Modal
function AddPaymentPlanModal({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planType: 'construction-linked' as const,
    bookingPercentage: 10,
    isRecommended: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentPlanService.create(projectId, {
        name: formData.name,
        description: formData.description,
        planType: formData.planType,
        bookingAmount: { type: 'percentage', value: formData.bookingPercentage, dueWithin: 7 },
        milestones: [
          { name: 'On Agreement', dueType: 'days-from-booking', dueValue: 30, amountType: 'percentage', amountValue: 20, order: 1 },
          { name: 'On Plinth', dueType: 'construction-stage', constructionStage: 'Plinth', amountType: 'percentage', amountValue: 20, order: 2 },
          { name: 'On Structure', dueType: 'construction-stage', constructionStage: 'Structure', amountType: 'percentage', amountValue: 25, order: 3 },
          { name: 'On Possession', dueType: 'on-possession', amountType: 'percentage', amountValue: 25, order: 4 }
        ],
        display: { isRecommended: formData.isRecommended, priority: formData.isRecommended ? 10 : 0 }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payment plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Add Payment Plan</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Construction Linked Plan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="construction-linked">Construction Linked</option>
                <option value="time-linked">Time Linked</option>
                <option value="down-payment">Down Payment</option>
                <option value="flexi">Flexi Payment</option>
                <option value="subvention">Subvention</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Amount %</label>
              <input
                type="number"
                value={formData.bookingPercentage}
                onChange={(e) => setFormData({ ...formData, bookingPercentage: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recommended"
              checked={formData.isRecommended}
              onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="recommended" className="text-sm text-gray-700">Mark as Recommended</label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Default milestones will be created: Booking (10%) → Agreement (20%) → Plinth (20%) → Structure (25%) → Possession (25%)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !formData.name || !formData.description} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
