import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { builderService, BuilderRegistrationData } from '../services/builderService';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const COMPANY_TYPES = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'pvt-ltd', label: 'Private Limited' },
  { value: 'ltd', label: 'Limited' },
  { value: 'llp', label: 'LLP' }
];

const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed-use', label: 'Mixed Use' },
  { value: 'township', label: 'Township' },
  { value: 'villa', label: 'Villa' },
  { value: 'plotted-development', label: 'Plotted Development' }
];

const SEGMENTS = [
  { value: 'affordable', label: 'Affordable' },
  { value: 'mid-range', label: 'Mid Range' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'ultra-luxury', label: 'Ultra Luxury' }
];

export default function BuilderRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BuilderRegistrationData>({
    companyName: '',
    brandName: '',
    companyType: 'pvt-ltd',
    establishedYear: new Date().getFullYear() - 5,
    employeeCount: '11-50',
    rera: {
      registrationNumber: '',
      state: 'Telangana',
      validUntil: ''
    },
    gst: { number: '' },
    pan: { number: '' },
    contact: {
      email: user?.email || '',
      phone: user?.phone || '',
      alternatePhone: '',
      website: ''
    },
    address: {
      registered: {
        fullAddress: '',
        city: '',
        state: 'Telangana',
        pincode: ''
      }
    },
    about: {
      shortDescription: '',
      fullDescription: ''
    },
    specialization: {
      propertyTypes: ['residential'],
      segments: ['mid-range']
    }
  });

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayToggle = (field: string, value: string) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      const arr = current[keys[keys.length - 1]] as string[];
      if (arr.includes(value)) {
        current[keys[keys.length - 1]] = arr.filter(v => v !== value);
      } else {
        current[keys[keys.length - 1]] = [...arr, value];
      }
      return newData;
    });
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.companyName || formData.companyName.length < 3) {
          setError('Company name must be at least 3 characters');
          return false;
        }
        if (!formData.companyType) {
          setError('Please select company type');
          return false;
        }
        if (!formData.establishedYear || formData.establishedYear > new Date().getFullYear()) {
          setError('Please enter a valid established year');
          return false;
        }
        break;
      case 2:
        if (!formData.rera.registrationNumber) {
          setError('RERA registration number is required');
          return false;
        }
        if (!formData.rera.validUntil) {
          setError('RERA validity date is required');
          return false;
        }
        break;
      case 3:
        if (!formData.contact.email || !formData.contact.phone) {
          setError('Email and phone are required');
          return false;
        }
        if (!formData.address.registered.fullAddress || !formData.address.registered.city) {
          setError('Address and city are required');
          return false;
        }
        if (!formData.address.registered.pincode || !/^[1-9][0-9]{5}$/.test(formData.address.registered.pincode)) {
          setError('Please enter a valid 6-digit pincode');
          return false;
        }
        break;
      case 4:
        if (!formData.about.shortDescription || formData.about.shortDescription.length < 50) {
          setError('Short description must be at least 50 characters');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    setError('');

    try {
      await builderService.register(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your builder profile has been submitted for verification. Our team will review your details and get back to you within 2-3 business days.
          </p>
          <button
            onClick={() => navigate('/builder/dashboard')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register as Builder/Developer</h1>
          <p className="text-gray-600 mt-2">Join IndiaPropertyAds to list your projects and reach more buyers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 5 && (
                <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-8 px-4">
          <span>Company</span>
          <span>RERA</span>
          <span>Contact</span>
          <span>About</span>
          <span>Review</span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., ABC Developers Pvt Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name (if different)
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., ABC Homes"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.companyType}
                    onChange={(e) => handleChange('companyType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {COMPANY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => handleChange('establishedYear', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Count
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => handleChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: RERA & Compliance */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">RERA & Compliance</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RERA Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.rera.registrationNumber}
                  onChange={(e) => handleChange('rera.registrationNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., P02400001234"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RERA State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.rera.state}
                    onChange={(e) => handleChange('rera.state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.rera.validUntil}
                    onChange={(e) => handleChange('rera.validUntil', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gst?.number || ''}
                  onChange={(e) => handleChange('gst.number', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 36AABCU9603R1ZM"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.pan?.number || ''}
                  onChange={(e) => handleChange('pan.number', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., AABCU9603R"
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleChange('contact.email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => handleChange('contact.phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.alternatePhone || ''}
                    onChange={(e) => handleChange('contact.alternatePhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.contact.website || ''}
                    onChange={(e) => handleChange('contact.website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registered Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address.registered.fullAddress}
                  onChange={(e) => handleChange('address.registered.fullAddress', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Building name, Street, Area"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.registered.city}
                    onChange={(e) => handleChange('address.registered.city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.address.registered.state}
                    onChange={(e) => handleChange('address.registered.state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.registered.pincode}
                    onChange={(e) => handleChange('address.registered.pincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: About & Specialization */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About & Specialization</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description <span className="text-red-500">*</span>
                  <span className="text-gray-400 ml-2">({formData.about.shortDescription.length}/300)</span>
                </label>
                <textarea
                  value={formData.about.shortDescription}
                  onChange={(e) => handleChange('about.shortDescription', e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description of your company (min 50 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={formData.about.fullDescription || ''}
                  onChange={(e) => handleChange('about.fullDescription', e.target.value)}
                  rows={5}
                  maxLength={3000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Detailed description of your company, history, achievements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Types You Specialize In
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleArrayToggle('specialization.propertyTypes', type.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        formData.specialization?.propertyTypes.includes(type.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Segments
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEGMENTS.map(seg => (
                    <button
                      key={seg.value}
                      type="button"
                      onClick={() => handleArrayToggle('specialization.segments', seg.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        formData.specialization?.segments.includes(seg.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Company Details</h3>
                  <p className="text-gray-600">{formData.companyName}</p>
                  {formData.brandName && <p className="text-gray-500 text-sm">Brand: {formData.brandName}</p>}
                  <p className="text-gray-500 text-sm">
                    {COMPANY_TYPES.find(t => t.value === formData.companyType)?.label} | Est. {formData.establishedYear}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">RERA Registration</h3>
                  <p className="text-gray-600">{formData.rera.registrationNumber}</p>
                  <p className="text-gray-500 text-sm">
                    {formData.rera.state} | Valid until {new Date(formData.rera.validUntil).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                  <p className="text-gray-600">{formData.contact.email} | {formData.contact.phone}</p>
                  <p className="text-gray-500 text-sm">
                    {formData.address.registered.city}, {formData.address.registered.state} - {formData.address.registered.pincode}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">About</h3>
                  <p className="text-gray-600 text-sm">{formData.about.shortDescription}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Specialization</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.specialization?.propertyTypes.map(t => (
                      <span key={t} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {PROPERTY_TYPES.find(p => p.value === t)?.label}
                      </span>
                    ))}
                    {formData.specialization?.segments.map(s => (
                      <span key={s} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {SEGMENTS.find(seg => seg.value === s)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> By submitting, you confirm that all information provided is accurate. 
                  Your profile will be reviewed by our team before activation.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
