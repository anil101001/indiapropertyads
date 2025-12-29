import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { projectService, ProjectCreateData } from '../services/builderService';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const PROJECT_TYPES = [
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

const CONSTRUCTION_STATUS = [
  { value: 'pre-launch', label: 'Pre-Launch' },
  { value: 'new-launch', label: 'New Launch' },
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'nearing-possession', label: 'Nearing Possession' },
  { value: 'ready-to-move', label: 'Ready to Move' }
];

const UNIT_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Studio', 'Penthouse', 'Duplex', 'Villa', 'Plot'];

const AMENITY_CATEGORIES = [
  { value: 'basic', label: 'Basic', amenities: ['24/7 Security', 'Power Backup', 'Water Supply', 'Parking', 'Lift', 'Intercom'] },
  { value: 'lifestyle', label: 'Lifestyle', amenities: ['Clubhouse', 'Swimming Pool', 'Gym', 'Party Hall', 'Landscaped Gardens', 'Jogging Track'] },
  { value: 'sports', label: 'Sports', amenities: ['Tennis Court', 'Badminton Court', 'Basketball Court', 'Cricket Pitch', 'Table Tennis', 'Squash Court'] },
  { value: 'safety', label: 'Safety', amenities: ['CCTV', 'Fire Safety', 'Earthquake Resistant', 'Gated Community', 'Video Door Phone'] },
  { value: 'convenience', label: 'Convenience', amenities: ['Shopping Complex', 'ATM', 'Pharmacy', 'Creche', 'Laundry', 'Cafeteria'] },
  { value: 'eco-friendly', label: 'Eco-Friendly', amenities: ['Rainwater Harvesting', 'Solar Panels', 'STP', 'Organic Waste Converter', 'EV Charging'] }
];

export default function AddProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    projectType: 'residential',
    segment: 'mid-range',
    location: {
      fullAddress: '',
      locality: '',
      city: '',
      state: 'Telangana',
      pincode: '',
      landmark: ''
    },
    details: {
      totalArea: '',
      totalTowers: '',
      totalFloors: '',
      totalUnits: '',
      unitTypes: [] as string[],
      sizeRange: { min: '', max: '' },
      priceRange: { min: '', max: '' }
    },
    approvals: {
      rera: {
        registrationNumber: '',
        validUntil: ''
      }
    },
    construction: {
      status: 'under-construction',
      expectedCompletion: ''
    },
    amenities: [] as { category: string; name: string }[]
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

  const toggleUnitType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        unitTypes: prev.details.unitTypes.includes(type)
          ? prev.details.unitTypes.filter(t => t !== type)
          : [...prev.details.unitTypes, type]
      }
    }));
  };

  const toggleAmenity = (category: string, name: string) => {
    setFormData(prev => {
      const exists = prev.amenities.some(a => a.category === category && a.name === name);
      if (exists) {
        return {
          ...prev,
          amenities: prev.amenities.filter(a => !(a.category === category && a.name === name))
        };
      }
      return {
        ...prev,
        amenities: [...prev.amenities, { category, name }]
      };
    });
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.name || formData.name.length < 3) {
          setError('Project name must be at least 3 characters');
          return false;
        }
        if (!formData.projectType || !formData.segment) {
          setError('Please select project type and segment');
          return false;
        }
        break;
      case 2:
        if (!formData.location.fullAddress || !formData.location.locality || !formData.location.city) {
          setError('Address, locality and city are required');
          return false;
        }
        if (!formData.location.pincode || !/^[1-9][0-9]{5}$/.test(formData.location.pincode)) {
          setError('Please enter a valid 6-digit pincode');
          return false;
        }
        break;
      case 3:
        if (!formData.details.totalArea || !formData.details.totalUnits) {
          setError('Total area and units are required');
          return false;
        }
        if (!formData.details.sizeRange.min || !formData.details.sizeRange.max) {
          setError('Size range is required');
          return false;
        }
        if (!formData.details.priceRange.min || !formData.details.priceRange.max) {
          setError('Price range is required');
          return false;
        }
        if (formData.details.unitTypes.length === 0) {
          setError('Please select at least one unit type');
          return false;
        }
        break;
      case 4:
        if (!formData.approvals.rera.registrationNumber) {
          setError('RERA registration number is required');
          return false;
        }
        if (!formData.approvals.rera.validUntil) {
          setError('RERA validity date is required');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 6));
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
      const projectData: ProjectCreateData = {
        name: formData.name,
        tagline: formData.tagline || undefined,
        projectType: formData.projectType,
        segment: formData.segment,
        location: {
          fullAddress: formData.location.fullAddress,
          locality: formData.location.locality,
          city: formData.location.city,
          state: formData.location.state,
          pincode: formData.location.pincode,
          landmark: formData.location.landmark || undefined
        },
        details: {
          totalArea: Number(formData.details.totalArea),
          totalTowers: formData.details.totalTowers ? Number(formData.details.totalTowers) : undefined,
          totalFloors: formData.details.totalFloors ? Number(formData.details.totalFloors) : undefined,
          totalUnits: Number(formData.details.totalUnits),
          unitTypes: formData.details.unitTypes,
          sizeRange: {
            min: Number(formData.details.sizeRange.min),
            max: Number(formData.details.sizeRange.max)
          },
          priceRange: {
            min: Number(formData.details.priceRange.min),
            max: Number(formData.details.priceRange.max)
          }
        },
        approvals: {
          rera: {
            registrationNumber: formData.approvals.rera.registrationNumber,
            validUntil: formData.approvals.rera.validUntil
          }
        },
        construction: {
          status: formData.construction.status,
          expectedCompletion: formData.construction.expectedCompletion || undefined
        },
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined
      };

      const project = await projectService.create(projectData);
      setCreatedProjectId(project._id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Created!</h2>
          <p className="text-gray-600 mb-6">
            Your project has been saved as a draft. You can add images and submit for approval from the project page.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/builder/projects/${createdProjectId}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              View Project
            </button>
            <button
              onClick={() => navigate('/builder/projects')}
              className="text-gray-600 hover:text-gray-900"
            >
              Go to All Projects
            </button>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Project</h1>
          <p className="text-gray-600 mt-2">List your property project on IndiaPropertyAds</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
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
              {s < 6 && (
                <div className={`w-8 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-8 px-2">
          <span>Basic</span>
          <span>Location</span>
          <span>Details</span>
          <span>RERA</span>
          <span>Amenities</span>
          <span>Review</span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Sunrise Heights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Where Dreams Meet Reality"
                  maxLength={150}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleChange('projectType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {PROJECT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.segment}
                    onChange={(e) => handleChange('segment', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {SEGMENTS.map(seg => (
                      <option key={seg.value} value={seg.value}>{seg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.location.fullAddress}
                  onChange={(e) => handleChange('location.fullAddress', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Plot No, Survey No, Street Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locality/Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.locality}
                    onChange={(e) => handleChange('location.locality', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Gachibowli"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleChange('location.city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Hyderabad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location.state}
                    onChange={(e) => handleChange('location.state', e.target.value)}
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
                    value={formData.location.pincode}
                    onChange={(e) => handleChange('location.pincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => handleChange('location.landmark', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Near IT Park"
                />
              </div>
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Area (acres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.details.totalArea}
                    onChange={(e) => handleChange('details.totalArea', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    step="0.1"
                    min="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Towers
                  </label>
                  <input
                    type="number"
                    value={formData.details.totalTowers}
                    onChange={(e) => handleChange('details.totalTowers', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    value={formData.details.totalFloors}
                    onChange={(e) => handleChange('details.totalFloors', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Units <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.details.totalUnits}
                  onChange={(e) => handleChange('details.totalUnits', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Types <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {UNIT_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleUnitType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        formData.details.unitTypes.includes(type)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size Range (sq.ft) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={formData.details.sizeRange.min}
                      onChange={(e) => handleChange('details.sizeRange.min', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Min"
                      min="100"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={formData.details.sizeRange.max}
                      onChange={(e) => handleChange('details.sizeRange.max', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Max"
                      min="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={formData.details.priceRange.min}
                      onChange={(e) => handleChange('details.priceRange.min', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Min"
                      min="100000"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={formData.details.priceRange.max}
                      onChange={(e) => handleChange('details.priceRange.max', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Max"
                      min="100000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: RERA & Construction */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">RERA & Construction Status</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RERA Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.approvals.rera.registrationNumber}
                  onChange={(e) => handleChange('approvals.rera.registrationNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., P02400001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RERA Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.approvals.rera.validUntil}
                  onChange={(e) => handleChange('approvals.rera.validUntil', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Construction Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.construction.status}
                  onChange={(e) => handleChange('construction.status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {CONSTRUCTION_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {formData.construction.status !== 'ready-to-move' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.construction.expectedCompletion}
                    onChange={(e) => handleChange('construction.expectedCompletion', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: Amenities */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <p className="text-gray-500 text-sm mb-4">Select the amenities available in your project</p>
              
              {AMENITY_CATEGORIES.map(category => (
                <div key={category.value} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{category.label}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.amenities.map(amenity => {
                      const isSelected = formData.amenities.some(
                        a => a.category === category.value && a.name === amenity
                      );
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(category.value, amenity)}
                          className={`px-3 py-1.5 rounded-full text-sm transition ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p className="text-sm text-gray-500">
                Selected: {formData.amenities.length} amenities
              </p>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Project</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{formData.name}</h3>
                  {formData.tagline && <p className="text-gray-500 text-sm italic">{formData.tagline}</p>}
                  <p className="text-gray-600 text-sm mt-1">
                    {PROJECT_TYPES.find(t => t.value === formData.projectType)?.label} • {SEGMENTS.find(s => s.value === formData.segment)?.label}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Location</h4>
                  <p className="text-gray-600 text-sm">
                    {formData.location.locality}, {formData.location.city}, {formData.location.state} - {formData.location.pincode}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Project Details</h4>
                  <p className="text-gray-600 text-sm">
                    {formData.details.totalArea} acres • {formData.details.totalUnits} units
                    {formData.details.totalTowers && ` • ${formData.details.totalTowers} towers`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Size: {formData.details.sizeRange.min} - {formData.details.sizeRange.max} sq.ft
                  </p>
                  <p className="text-gray-600 text-sm">
                    Price: ₹{Number(formData.details.priceRange.min).toLocaleString()} - ₹{Number(formData.details.priceRange.max).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.details.unitTypes.map(type => (
                      <span key={type} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">RERA & Status</h4>
                  <p className="text-gray-600 text-sm">
                    RERA: {formData.approvals.rera.registrationNumber}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Status: {CONSTRUCTION_STATUS.find(s => s.value === formData.construction.status)?.label}
                  </p>
                </div>

                {formData.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">Amenities ({formData.amenities.length})</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.amenities.slice(0, 10).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {a.name}
                        </span>
                      ))}
                      {formData.amenities.length > 10 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{formData.amenities.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Your project will be saved as a draft. You can add images and submit for approval later.
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
                onClick={() => navigate('/builder/projects')}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
            )}

            {step < 6 ? (
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
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
