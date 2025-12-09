import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { propertyService, Property } from '../services/propertyService';

// Removed static amenities list - will be dynamically generated based on property type

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [areaUnit, setAreaUnit] = useState('sqft'); // Default unit

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment' as 'apartment' | 'villa' | 'independent-house' | 'plot' | 'shop' | 'office' | 'warehouse' | 'showroom',
    listingType: 'sale' as 'sale' | 'rent',
    plotType: 'gated-community' as 'gated-community' | 'independent',
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    carpetArea: '',
    bedrooms: '2',
    bathrooms: '2',
    balconies: '1',
    coveredParking: '1',
    openParking: '0',
    floor: '',
    totalFloors: '',
    propertyAge: '<1' as '<1' | '1-5' | '5-10' | '10+',
    furnishing: 'unfurnished' as 'unfurnished' | 'semi-furnished' | 'fully-furnished',
    possession: 'immediate' as 'immediate' | '1-month' | '3-months' | 'under-construction',
    expectedPrice: '',
    priceNegotiable: true,
    maintenanceCharges: '',
    securityDeposit: '',
    amenities: [] as string[],
    youtube: '',
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
  });

  // Images
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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
    return ['shop', 'office', 'warehouse', 'showroom'].includes(formData.propertyType);
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

    // For gated community plots
    if (formData.propertyType === 'plot' && formData.plotType === 'gated-community') {
      return [...buildingAmenities, ...independentPlotAmenities, ...commonAmenities];
    }
    
    // For independent plots
    if (formData.propertyType === 'plot' && formData.plotType === 'independent') {
      return [...independentPlotAmenities, ...commonAmenities];
    }
    
    // For buildings (apartment, villa, house)
    return [...buildingAmenities, ...commonAmenities];
  };

  const availableAmenities = getAvailableAmenities();

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await propertyService.getPropertyById(id!);
      if (response.success) {
        const property: Property = response.data;
        
        // Populate form with property data
        setFormData({
          title: property.title,
          description: property.description,
          propertyType: property.propertyType,
          listingType: property.listingType,
          plotType: (property as any).plotType || 'gated-community',
          fullAddress: property.address.fullAddress,
          city: property.address.city,
          state: property.address.state,
          pincode: property.address.pincode,
          landmark: property.address.landmark || '',
          carpetArea: property.specs.carpetArea.toString(),
          bedrooms: property.specs.bedrooms.toString(),
          bathrooms: property.specs.bathrooms.toString(),
          balconies: property.specs.balconies.toString(),
          coveredParking: property.specs.parking.covered.toString(),
          openParking: property.specs.parking.open.toString(),
          floor: property.specs.floor?.toString() || '',
          totalFloors: property.specs.totalFloors?.toString() || '',
          propertyAge: property.specs.propertyAge,
          furnishing: property.specs.furnishing,
          possession: property.specs.possession,
          expectedPrice: property.pricing.expectedPrice.toString(),
          priceNegotiable: property.pricing.priceNegotiable,
          maintenanceCharges: property.pricing.maintenanceCharges?.toString() || '',
          securityDeposit: property.pricing.securityDeposit?.toString() || '',
          amenities: property.amenities,
          youtube: property.socialMedia?.youtube || '',
          facebook: property.socialMedia?.facebook || '',
          instagram: property.socialMedia?.instagram || '',
          twitter: property.socialMedia?.twitter || '',
          website: property.socialMedia?.website || '',
        });
        
        setExistingImages(property.images);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of images
    if (files.length + existingImages.length + newImages.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    // Validate file sizes
    const oversized = files.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setError('Each image must be less than 10MB');
      return;
    }

    setError(''); // Clear any previous errors
    setNewImages([...newImages, ...files]);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Upload new images if any
      let uploadedNewImages: any[] = [];
      if (newImages.length > 0) {
        const response = await propertyService.uploadImages(newImages);
        if (response.success) {
          uploadedNewImages = response.data.images;
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedNewImages];

      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        plotType: formData.propertyType === 'plot' ? (formData.plotType as 'gated-community' | 'independent') : undefined,
        address: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        specs: {
          carpetArea: Number(formData.carpetArea),
          // For commercial properties, set bedrooms/bathrooms/balconies to 0
          bedrooms: isCommercial() ? 0 : Number(formData.bedrooms),
          bathrooms: isCommercial() ? 0 : Number(formData.bathrooms),
          balconies: isCommercial() ? 0 : Number(formData.balconies),
          parking: {
            covered: Number(formData.coveredParking),
            open: Number(formData.openParking),
          },
          floor: formData.floor ? Number(formData.floor) : undefined,
          totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
          propertyAge: formData.propertyAge,
          furnishing: formData.furnishing,
          possession: formData.possession,
        },
        pricing: {
          expectedPrice: Number(formData.expectedPrice),
          priceNegotiable: formData.priceNegotiable,
          maintenanceCharges: formData.maintenanceCharges ? Number(formData.maintenanceCharges) : undefined,
          securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : undefined,
        },
        amenities: formData.amenities,
        images: allImages,
        socialMedia: {
          youtube: formData.youtube || undefined,
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
          website: formData.website || undefined,
        },
      };

      const response = await propertyService.updateProperty(id!, propertyData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-properties');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <Link
            to="/my-properties"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Properties
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-gray-600">Update your property details</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Property updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="e.g., Spacious 3BHK Apartment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="Describe your property..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <optgroup label="Residential">
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="independent-house">Independent House</option>
                      <option value="plot">Plot/Land</option>
                    </optgroup>
                    <optgroup label="Commercial">
                      <option value="shop">Shop</option>
                      <option value="office">Office Space</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="showroom">Showroom</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing For</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>

              {/* Plot Type - Only show for plots */}
              {formData.propertyType === 'plot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plot Type</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plotType: 'gated-community' })}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        formData.plotType === 'gated-community'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Gated Community
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plotType: 'independent' })}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        formData.plotType === 'independent'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Independent Plot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                <input
                  type="text"
                  required
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>

            <div className="space-y-4">
              {/* Carpet Area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carpet Area *</label>
                  <input
                    type="number"
                    required
                    value={formData.carpetArea}
                    onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., 1450"
                  />
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

              {/* Bedrooms, Bathrooms, Balconies - Only for residential properties */}
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

              {/* Floor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Floors</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              {/* Property Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Age</label>
                <select
                  value={formData.propertyAge}
                  onChange={(e) => setFormData({ ...formData, propertyAge: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="<1">Less than 1 year</option>
                  <option value="1-5">1-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Furnishing Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['unfurnished', 'semi-furnished', 'fully-furnished'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, furnishing: type as any })}
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

              {/* Possession Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Possession</label>
                <select
                  value={formData.possession}
                  onChange={(e) => setFormData({ ...formData, possession: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="immediate">Immediate</option>
                  <option value="1-month">Within 1 Month</option>
                  <option value="3-months">Within 3 Months</option>
                  <option value="under-construction">Under Construction</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price *</label>
                <input
                  type="number"
                  required
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  placeholder="₹"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.priceNegotiable}
                  onChange={(e) => setFormData({ ...formData, priceNegotiable: e.target.checked })}
                  className="w-4 h-4 text-primary-600"
                />
                <label className="text-sm text-gray-700">Price Negotiable</label>
              </div>

              {/* Maintenance & Security Deposit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Charges (₹/month)</label>
                  <input
                    type="number"
                    value={formData.maintenanceCharges}
                    onChange={(e) => setFormData({ ...formData, maintenanceCharges: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., 5000"
                  />
                </div>
                {formData.listingType === 'rent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="e.g., 100000"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
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

          {/* Images */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Images</h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImagePreviews.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {existingImages.length + newImages.length < 10 && (
              <div>
                <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer transition">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Add More Images (Max 10)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Social Media Links (Optional) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Social Media & Links (Optional)</h2>
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

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/my-properties')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
