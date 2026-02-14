import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Upload,
  X,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';

export default function AddProperty() {
  const navigate = useNavigate();
  const { } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [areaUnit, setAreaUnit] = useState('sqft'); // Default unit
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: 'apartment',
    listingType: 'sale',
    plotType: 'gated-community', // For plots only: 'gated-community' or 'independent'
    // Land/Plot specific details
    plotSubType: 'residential' as 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'sez' | 'mixed-use',
    zoningClassification: [] as string[],
    layoutStatus: 'approved-municipal' as 'approved-municipal' | 'approved-rera' | 'unapproved' | 'gated-community',
    ownershipType: 'freehold' as 'freehold' | 'leasehold',
    legalStatus: 'clear-title' as 'clear-title' | 'litigated' | 'rera-approved',
    plotAreaUnit: 'sqft' as 'sqft' | 'sqm' | 'yards' | 'acres' | 'hectares',
    plotArea: '',
    roadAccess: '',
    boundaryWall: false,
    waterConnection: false,
    electricityConnection: false,
    cornerPlot: false,
    gatedSecurity: false,
    // Location
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    // Price & Features
    expectedPrice: '',
    priceNegotiable: true,
    maintenanceCharges: '',
    securityDeposit: '',
    bedrooms: '2',
    bathrooms: '2',
    balconies: '1',
    carpetArea: '',
    coveredParking: '1',
    openParking: '0',
    furnishing: 'semi-furnished',
    floor: '',
    totalFloors: '',
    propertyAge: '<1',
    possession: 'immediate',
    // Amenities
    amenities: [] as string[],
    // Social Media
    youtube: '',
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    suggestedPrice: 0,
    priceRange: { min: 0, max: 0 },
    similarProperties: 12,
    marketDemand: 'High',
    tags: ['Premium', 'Well-Connected', 'Family-Friendly'],
  });

  // Update default unit when property type changes
  useEffect(() => {
    if (formData.propertyType === 'plot') {
      setAreaUnit('sqyd'); // Default to square yards for plots
    } else {
      setAreaUnit('sqft'); // Default to square feet for others
    }
  }, [formData.propertyType]);

  // Helper to check if property is commercial
  const isCommercial = () => {
    return ['shop', 'office', 'warehouse', 'showroom',
      'co-working', 'commercial-building', 'it-park', 'industrial-shed', 'cold-storage',
      'restaurant', 'clinic', 'hotel', 'educational'
    ].includes(formData.propertyType);
  };

  // Amenities based on property type
  const getAvailableAmenities = () => {
    const commonAmenities = [
      '24/7 Security',
      'Power Backup',
      'Water Supply',
      'CCTV',
      'Fire Safety',
    ];

    const buildingAmenities = [
      'Swimming Pool',
      'Gymnasium',
      'Lift',
      'Club House',
      'Children Play Area',
      'Parking',
      'Garden',
      'Intercom',
      'Visitor Parking',
      'Rainwater Harvesting',
    ];

    const independentPlotAmenities = [
      'Corner Plot',
      'Boundary Wall',
      'Road Access',
      'Electricity Connection',
      'Sewage System',
      'Street Lights',
      'Park Nearby',
    ];

    const commercialAmenities = [
      'Lift',
      'Parking',
      'Central AC',
      'Conference Room',
      'Cafeteria',
      'Reception Area',
      'High-Speed Internet',
      'Loading Bay',
      'Washrooms',
      'Public Transport Access',
    ];

    // For commercial properties
    if (isCommercial()) {
      return [...commercialAmenities, ...commonAmenities];
    }

    // For gated community plots, show building amenities (community facilities) + common
    if (formData.propertyType === 'plot' && formData.plotType === 'gated-community') {
      return [...buildingAmenities, ...independentPlotAmenities, ...commonAmenities];
    }
    
    // For independent plots, show only plot-specific + common amenities
    if (formData.propertyType === 'plot' && formData.plotType === 'independent') {
      return [...independentPlotAmenities, ...commonAmenities];
    }
    
    // For buildings (apartment, villa, house), show building + common amenities
    return [...buildingAmenities, ...commonAmenities];
  };

  const availableAmenities = getAvailableAmenities();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate
      if (images.length + fileArray.length > 10) {
        setError('Maximum 10 images allowed');
        return;
      }

      // Check file sizes
      const oversized = fileArray.find(f => f.size > 10 * 1024 * 1024);
      if (oversized) {
        setError('Each image must be less than 10MB');
        return;
      }

      // Add files
      setImages([...images, ...fileArray]);
      
      // Create previews
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
      setError('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImagesToS3 = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return null;
    }

    setUploading(true);
    setError('');

    try {
      const response = await propertyService.uploadImages(images);
      if (response.success) {
        console.log('📸 Images uploaded:', response.data.images);
        setUploadedImages(response.data.images);
        return response.data.images; // Return the images directly
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  // Simulate AI price suggestion based on input
  // Step-specific validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info validation
      if (!formData.title || formData.title.length < 10) {
        errors.title = 'Title must be at least 10 characters';
      }
      if (!formData.description || formData.description.length < 50) {
        errors.description = 'Description must be at least 50 characters';
      }
    }

    if (step === 2) {
      // Location validation
      if (!formData.fullAddress) {
        errors.fullAddress = 'Full address is required';
      }
      if (!formData.city) {
        errors.city = 'City is required';
      }
      if (!formData.state) {
        errors.state = 'State is required';
      }
      if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = 'Pincode must be 6 digits';
      }
    }

    if (step === 3) {
      // Price & Details validation
      const price = Number(formData.expectedPrice);
      if (!formData.expectedPrice || price < 10000) {
        errors.expectedPrice = 'Price must be at least ₹10,000';
      }

      const area = Number(formData.carpetArea);
      if (!formData.carpetArea || area < 100) {
        errors.carpetArea = 'Carpet area must be at least 100 sqft';
      }
    }

    if (step === 4) {
      // Image validation
      if (images.length === 0 && uploadedImages.length === 0) {
        errors.images = 'Please upload at least one image';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Full form validation
  const validateForm = (): boolean => {
    return validateStep(1) && validateStep(2) && validateStep(3) && validateStep(4);
  };

  // Handle next button click
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({}); // Clear errors when moving to next step
    }
  };

  const calculateAISuggestion = () => {
    const basePrice = parseInt(formData.carpetArea) * 8500; // ₹8,500 per sqft base
    const suggested = basePrice * (formData.propertyType === 'plot' ? 1.3 : 1);
    setAiSuggestions({
      suggestedPrice: suggested,
      priceRange: { min: suggested * 0.9, max: suggested * 1.1 },
      similarProperties: Math.floor(Math.random() * 20) + 5,
      marketDemand: ['High', 'Medium', 'Very High'][Math.floor(Math.random() * 3)],
      tags: ['Premium', 'Well-Connected', 'Family-Friendly', 'Investment Opportunity'].slice(
        0,
        Math.floor(Math.random() * 3) + 2
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors before submitting');
      return;
    }
    
    // Upload images first if not already uploaded
    let imagesToUse = uploadedImages;
    if (uploadedImages.length === 0 && images.length > 0) {
      const uploaded = await uploadImagesToS3();
      if (!uploaded || uploaded.length === 0) {
        setError('Failed to upload images');
        return;
      }
      imagesToUse = uploaded; // Use the returned images directly
    }
    
    console.log('🏠 Creating property with images:', imagesToUse);

    setSubmitting(true);
    setError('');

    try {
      const propertyData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        plotType: formData.propertyType === 'plot' ? (formData.layoutStatus === 'gated-community' ? 'gated-community' : 'independent') : undefined,
        address: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        specs: {
          carpetArea: formData.propertyType === 'plot' ? Number(formData.plotArea) || 100 : Number(formData.carpetArea),
          // For commercial properties and plots, set bedrooms/bathrooms/balconies to 0
          bedrooms: isCommercial() || formData.propertyType === 'plot' ? 0 : Number(formData.bedrooms),
          bathrooms: isCommercial() || formData.propertyType === 'plot' ? 0 : Number(formData.bathrooms),
          balconies: isCommercial() || formData.propertyType === 'plot' ? 0 : Number(formData.balconies),
          parking: {
            covered: Number(formData.coveredParking),
            open: Number(formData.openParking),
          },
          floor: formData.floor ? Number(formData.floor) : undefined,
          totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
          propertyAge: formData.propertyAge as '<1' | '1-5' | '5-10' | '10+',
          furnishing: formData.furnishing as 'unfurnished' | 'semi-furnished' | 'fully-furnished',
          possession: formData.possession as 'immediate' | '1-month' | '3-months' | 'under-construction',
        },
        pricing: {
          expectedPrice: Number(formData.expectedPrice),
          priceNegotiable: formData.priceNegotiable,
          maintenanceCharges: formData.maintenanceCharges ? Number(formData.maintenanceCharges) : undefined,
          securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : undefined,
        },
        amenities: formData.amenities,
        images: imagesToUse,
        socialMedia: {
          youtube: formData.youtube || undefined,
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
          website: formData.website || undefined,
        },
      };

      // Add landDetails for plot properties
      if (formData.propertyType === 'plot') {
        propertyData.landDetails = {
          plotSubType: formData.plotSubType,
          zoningClassification: formData.zoningClassification,
          layoutStatus: formData.layoutStatus,
          ownershipType: formData.ownershipType,
          legalStatus: formData.legalStatus,
          areaUnit: formData.plotAreaUnit,
          plotArea: Number(formData.plotArea) || 0,
          roadAccess: formData.roadAccess || undefined,
          boundaryWall: formData.boundaryWall,
          waterConnection: formData.waterConnection,
          electricityConnection: formData.electricityConnection,
          cornerPlot: formData.cornerPlot,
          gatedSecurity: formData.gatedSecurity,
        };
      }

      const response = await propertyService.createProperty(propertyData);
      
      if (response.success) {
        // Navigate to My Properties to see the newly created property
        navigate('/my-properties');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('⚠️ A property with the same title and address already exists. Please check your listings or modify the property details.');
      } else {
        setError(err.message || 'Failed to create property');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Details' },
    { number: 4, title: 'Photos & Submit' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-gray-600">Fill in the details below to list your property with AI assistance</p>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step.number
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? <CheckCircle className="h-6 w-6" /> : step.number}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* General Error (backend errors only) */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>

              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={() => validateForm()}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                    validationErrors.title 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-primary-500'
                  }`}
                  placeholder="e.g., Spacious 3BHK Apartment in Bandra (min 10 characters)"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <optgroup label="Residential">
                    <option value="apartment">Apartment / Flat</option>
                    <option value="villa">Villa</option>
                    <option value="independent-house">Independent House</option>
                    <option value="row-house">Row House</option>
                    <option value="duplex">Duplex</option>
                    <option value="triplex">Triplex</option>
                    <option value="builder-floor">Builder Floor</option>
                    <option value="studio">Studio Apartment</option>
                    <option value="serviced-apartment">Serviced Apartment</option>
                    <option value="farmhouse">Farmhouse</option>
                    <option value="vacation-home">Vacation Home</option>
                  </optgroup>
                  <optgroup label="Living">
                    <option value="co-living">Co-living</option>
                    <option value="pg">PG / Hostel</option>
                    <option value="retirement-home">Retirement Home</option>
                  </optgroup>
                  <optgroup label="Land">
                    <option value="plot">Plot / Land</option>
                  </optgroup>
                  <optgroup label="Commercial - Office & Retail">
                    <option value="office">Office Space</option>
                    <option value="co-working">Co-working Space</option>
                    <option value="shop">Retail Shop</option>
                    <option value="showroom">Showroom</option>
                  </optgroup>
                  <optgroup label="Commercial - Industrial">
                    <option value="warehouse">Warehouse / Godown</option>
                    <option value="industrial-shed">Industrial Shed</option>
                    <option value="cold-storage">Cold Storage</option>
                    <option value="it-park">IT Park / SEZ</option>
                  </optgroup>
                  <optgroup label="Commercial - Hospitality">
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="hotel">Hotel / Lodge</option>
                    <option value="clinic">Clinic / Hospital</option>
                    <option value="educational">Educational Institute</option>
                  </optgroup>
                </select>
              </div>

              {/* Land/Plot Specific Fields - Only show for plots */}
              {formData.propertyType === 'plot' && (
                <div className="space-y-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <span>🏞️</span> Land/Plot Details (Required)
                  </h3>

                  {/* Plot Sub-Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plot Sub-Type *</label>
                    <select
                      value={formData.plotSubType}
                      onChange={(e) => setFormData({ ...formData, plotSubType: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      <option value="residential">Residential Plot</option>
                      <option value="commercial">Commercial Plot</option>
                      <option value="industrial">Industrial Plot</option>
                      <option value="agricultural">Agricultural Land</option>
                      <option value="sez">SEZ Plot</option>
                      <option value="mixed-use">Mixed-Use Land</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ownership Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Type *</label>
                      <select
                        value={formData.ownershipType}
                        onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="freehold">Freehold</option>
                        <option value="leasehold">Leasehold</option>
                      </select>
                    </div>

                    {/* Legal Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Legal Status *</label>
                      <select
                        value={formData.legalStatus}
                        onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="clear-title">Clear Title</option>
                        <option value="litigated">Litigated</option>
                        <option value="rera-approved">RERA Approved</option>
                      </select>
                    </div>
                  </div>

                  {/* Layout Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout Status *</label>
                    <select
                      value={formData.layoutStatus}
                      onChange={(e) => setFormData({ ...formData, layoutStatus: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      <option value="approved-municipal">Approved (Municipal)</option>
                      <option value="approved-rera">Approved (RERA)</option>
                      <option value="unapproved">Unapproved</option>
                      <option value="gated-community">Gated Community</option>
                    </select>
                  </div>

                  {/* Plot Area with Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plot Area *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.plotArea}
                        onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Enter plot area"
                      />
                      <select
                        value={formData.plotAreaUnit}
                        onChange={(e) => setFormData({ ...formData, plotAreaUnit: e.target.value as any })}
                        className="w-32 px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="sqft">Sq.Ft</option>
                        <option value="sqm">Sq.M</option>
                        <option value="yards">Yards</option>
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                      </select>
                    </div>
                  </div>

                  {/* Zoning Classification - Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zoning Classification</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'approved-residential', label: 'Residential' },
                        { value: 'approved-commercial', label: 'Commercial' },
                        { value: 'approved-industrial', label: 'Industrial' },
                        { value: 'agricultural', label: 'Agricultural' },
                        { value: 'it-sez', label: 'IT/SEZ' },
                        { value: 'mixed-use-approved', label: 'Mixed-Use' },
                      ].map((zone) => (
                        <button
                          key={zone.value}
                          type="button"
                          onClick={() => {
                            const current = formData.zoningClassification;
                            const newZoning = current.includes(zone.value)
                              ? current.filter(z => z !== zone.value)
                              : [...current, zone.value];
                            setFormData({ ...formData, zoningClassification: newZoning });
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            formData.zoningClassification.includes(zone.value)
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {zone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Road Access */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Road Access</label>
                    <input
                      type="text"
                      value={formData.roadAccess}
                      onChange={(e) => setFormData({ ...formData, roadAccess: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="e.g., Highway facing, 4-lane road, Internal road"
                    />
                  </div>

                  {/* Land Amenities - Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Land Features & Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={formData.boundaryWall}
                          onChange={(e) => setFormData({ ...formData, boundaryWall: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Boundary Wall</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={formData.waterConnection}
                          onChange={(e) => setFormData({ ...formData, waterConnection: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Water Connection</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={formData.electricityConnection}
                          onChange={(e) => setFormData({ ...formData, electricityConnection: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Electricity</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={formData.cornerPlot}
                          onChange={(e) => setFormData({ ...formData, cornerPlot: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Corner Plot</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={formData.gatedSecurity}
                          onChange={(e) => setFormData({ ...formData, gatedSecurity: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Gated Security</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing For</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'sale', label: 'Sale' },
                    { value: 'rent', label: 'Rent' },
                    { value: 'lease', label: 'Lease' },
                    { value: 'pre-leased', label: 'Pre-Leased' },
                    { value: 'invest', label: 'Investment' },
                    { value: 'fractional', label: 'Fractional' },
                    { value: 'joint-venture', label: 'Joint Venture' },
                    { value: 'auction', label: 'Auction' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, listingType: option.value })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        formData.listingType === option.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => validateForm()}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                    validationErrors.description 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-primary-500'
                  }`}
                  placeholder="Describe your property... (min 50 characters)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/50 characters</p>
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Location</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                <input
                  type="text"
                  required
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  onBlur={() => validateStep(2)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                    validationErrors.fullAddress 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-primary-500'
                  }`}
                  placeholder="Building name, street, landmark"
                />
                {validationErrors.fullAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.fullAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Map will be shown here based on address</p>
                <button
                  type="button"
                  className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Verify Location on Map
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>

              {/* Price with AI Suggestion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                    onBlur={() => { calculateAISuggestion(); validateStep(3); }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none ${
                      validationErrors.expectedPrice 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="12500000 (min ₹10,000)"
                  />
                </div>
                {validationErrors.expectedPrice && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.expectedPrice}
                  </p>
                )}
                {aiSuggestions.suggestedPrice > 0 && (
                  <div className="mt-3 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">AI Price Suggestion</p>
                        <p className="text-sm text-gray-700">
                          Based on {aiSuggestions.similarProperties} similar properties, we suggest:
                        </p>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          ₹{aiSuggestions.suggestedPrice.toLocaleString()} (₹
                          {aiSuggestions.priceRange.min.toLocaleString()} - ₹
                          {aiSuggestions.priceRange.max.toLocaleString()})
                        </p>
                        <div className="flex gap-2 mt-2">
                          {aiSuggestions.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-white text-primary-700 text-xs font-semibold rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carpet Area *</label>
                  <input
                    type="number"
                    required
                    value={formData.carpetArea}
                    onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                    onBlur={() => validateStep(3)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                      validationErrors.carpetArea 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                    placeholder="1450 (min 100 sqft)"
                  />
                  {validationErrors.carpetArea && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.carpetArea}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {formData.propertyType === 'plot' ? (
                      <>
                        <option value="sqyd">Sq.Yd</option>
                        <option value="sqft">Sq.Ft</option>
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                      </>
                    ) : formData.propertyType === 'warehouse' ? (
                      <>
                        <option value="sqft">Sq.Ft</option>
                        <option value="sqm">Sq.M</option>
                        <option value="acres">Acres</option>
                      </>
                    ) : (
                      <>
                        <option value="sqft">Sq.Ft</option>
                        <option value="sqm">Sq.M</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Parking - Only for residential properties */}
              {!isCommercial() && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} BHK
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Balconies</label>
                    <select
                      value={formData.balconies}
                      onChange={(e) => setFormData({ ...formData, balconies: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      {[0, 1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Parking for all property types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Covered Parking</label>
                  <select
                    value={formData.coveredParking}
                    onChange={(e) => setFormData({ ...formData, coveredParking: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Open Parking</label>
                  <select
                    value={formData.openParking}
                    onChange={(e) => setFormData({ ...formData, openParking: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['unfurnished', 'semi-furnished', 'fully-furnished'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, furnishing: type })}
                      className={`py-3 rounded-lg font-semibold capitalize transition ${
                        formData.furnishing === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-lg text-sm font-medium transition border-2 ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 inline mr-2 ${
                          formData.amenities.includes(amenity) ? 'text-primary-600' : 'text-gray-300'
                        }`}
                      />
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Photos *</h2>

              {/* Image Upload */}
              <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary-500 transition ${
                validationErrors.images ? 'border-red-300' : 'border-gray-300'
              }`}>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop images or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 10MB each</p>
                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block">
                    Choose Files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* Validation Error */}
              {validationErrors.images && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.images}
                </p>
              )}

              {/* Image Preview */}
              {images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Uploaded Images ({images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                          alt={`Property ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Image Analysis */}
              {images.length > 0 && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">AI Image Analysis</p>
                      <p className="text-sm text-gray-700">
                        ✓ All images are high quality<br />
                        ✓ Detected: Living room, bedroom, kitchen<br />
                        ✓ Good lighting and composition
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Links (Optional) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media & Links (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">Share links to property videos, virtual tours, or social media pages</p>
                
                <div className="space-y-4">
                  {/* YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📺 YouTube Video/Tour Link
                    </label>
                    <input
                      type="url"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📘 Facebook Page/Post
                    </label>
                    <input
                      type="url"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📷 Instagram Profile/Post
                    </label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  {/* Twitter/X */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🐦 Twitter/X Profile
                    </label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="https://twitter.com/... or https://x.com/..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🌐 Property Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className={`ml-auto px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Submit Property
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
