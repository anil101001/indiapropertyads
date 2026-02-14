import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Property from '../models/Property.model';
import User from '../models/User.model';
import logger from '../utils/logger';
import { parseSearchQuery } from '../utils/searchParser';

// @route   POST /api/v1/properties
// @desc    Create new property
// @access  Private (Owner, Agent)
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user?.userId
    };
    
    // Check for duplicate property
    const existingProperty = await Property.findOne({
      owner: req.user?.userId,
      title: propertyData.title,
      'address.city': propertyData.address?.city,
      'address.fullAddress': propertyData.address?.fullAddress,
      status: { $ne: 'sold' } // Don't check against sold properties
    });

    if (existingProperty) {
      res.status(409).json({
        success: false,
        message: 'A property with the same title and address already exists',
        duplicateId: existingProperty._id
      });
      return;
    }
    
    // Agents can publish directly, owners need approval
    if (req.user?.role === 'agent') {
      propertyData.status = 'approved';
      propertyData.publishedAt = new Date();
    } else {
      propertyData.status = 'pending-approval';
    }
    
    const property = await Property.create(propertyData);
    
    logger.info(`Property created: ${property._id} by ${req.user?.email} with status: ${property.status}`);
    
    res.status(201).json({
      success: true,
      data: property,
      message: req.user?.role === 'agent' 
        ? 'Property published successfully' 
        : 'Property submitted for approval'
    });
    
  } catch (error: any) {
    logger.error('Create property error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create property'
    });
  }
};

// @route   GET /api/v1/properties
// @desc    Get all properties with filters
// @access  Public
export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      status = 'approved',
      page = 1,
      limit = 20,
      sort = '-publishedAt',
      search,
      q, // Support both 'search' and 'q' parameters
      applyAffordability, // New parameter to enable affordability filtering
      // Land/Plot specific filters
      plotSubType,
      ownershipType,
      legalStatus,
      layoutStatus,
      zoningClassification, // comma-separated values for multi-select
      boundaryWall,
      waterConnection,
      electricityConnection,
      cornerPlot,
      gatedSecurity,
      minPlotArea,
      maxPlotArea,
      areaUnit,
      // New expanded filters
      propertyCategory,
      segment,
      tags, // comma-separated
      locality,
      // Lease / Investment filters
      tenantType,
      occupancyStatus,
      minRentalYield,
      maxRentalYield,
      assetGrade,
      // Compliance filters
      reraApproved,
      // Commercial filters
      roadFacing,
      highFootfall,
      truckAccess,
      loadingBay
    } = req.query;
    
    // Debug logging
    logger.info(`🔍 User info: ${JSON.stringify(req.user)} | Requested status: ${status}`);
    
    // Build query
    const query: any = {};
    
    // Only show approved properties to public (unless owner/admin)
    if (!req.user || req.user.role === 'buyer') {
      query.status = 'approved';
      logger.info('⚠️ No authenticated user or buyer role - defaulting to approved');
    } else if (status) {
      query.status = status;
      logger.info(`✅ Authenticated ${req.user.role} - using status: ${status}`);
    }
    
    // Text search across multiple fields (support both 'search' and 'q' parameters)
    const rawSearchTerm = (search || q) as string;
    let parsedSearch: any = { text: rawSearchTerm };

    // Helper function to escape regex special characters
    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Parse natural language search if provided
    if (rawSearchTerm && rawSearchTerm.trim()) {
      parsedSearch = parseSearchQuery(rawSearchTerm.trim());
      logger.info(`🧠 Parsed search: ${JSON.stringify(parsedSearch)}`);
      
      if (parsedSearch.text && parsedSearch.text.trim()) {
        // Escape special regex characters to prevent regex errors
        const escapedText = escapeRegex(parsedSearch.text.trim());
        const searchRegex = new RegExp(escapedText, 'i');
        
        // Use $and to ensure text search is combined with other filters
        if (!query.$and) {
          query.$and = [];
        }
        
        // If explicit city filter is provided, exclude city from text search $or
        // to avoid conflicts between explicit city filter and text search
        const searchFields = city 
          ? [
              { title: searchRegex },
              { description: searchRegex },
              { 'address.state': searchRegex },
              { 'address.landmark': searchRegex },
              { 'address.fullAddress': searchRegex }
            ]
          : [
              { title: searchRegex },
              { description: searchRegex },
              { 'address.city': searchRegex },
              { 'address.state': searchRegex },
              { 'address.landmark': searchRegex },
              { 'address.fullAddress': searchRegex }
            ];
        
        query.$and.push({ $or: searchFields });
        logger.info(`🔍 Text search: "${parsedSearch.text}" (escaped: "${escapedText}")`);
      }
    }
    
    // Apply explicit city filter (exact match for city name to avoid "Mumbai" matching "Navi Mumbai")
    if (city) {
      const escapedCity = escapeRegex(city as string);
      query['address.city'] = new RegExp(`^${escapedCity}$`, 'i');
      logger.info(`🏙️ City filter: "${city}" (exact match)`);
    }
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    
    // New category, segment, tags, locality filters
    if (propertyCategory) {
      query.propertyCategory = propertyCategory;
      logger.info(`🏷️ Property category filter: ${propertyCategory}`);
    }
    if (segment) {
      query.segment = segment;
      logger.info(`💎 Segment filter: ${segment}`);
    }
    if (tags) {
      const tagValues = (tags as string).split(',').map(v => v.trim());
      query.tags = { $in: tagValues };
      logger.info(`🏷️ Tags filter: ${tagValues.join(', ')}`);
    }
    if (locality) {
      const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedLocality = escapeRegex(locality as string);
      query['address.locality'] = new RegExp(escapedLocality, 'i');
      logger.info(`📍 Locality filter: ${locality}`);
    }
    
    // Land/Plot specific filters (only apply when propertyType is 'plot')
    if (propertyType === 'plot' || plotSubType || ownershipType || legalStatus || layoutStatus || zoningClassification) {
      if (plotSubType) {
        query['landDetails.plotSubType'] = plotSubType;
        logger.info(`🏞️ Plot sub-type filter: ${plotSubType}`);
      }
      if (ownershipType) {
        query['landDetails.ownershipType'] = ownershipType;
        logger.info(`📜 Ownership type filter: ${ownershipType}`);
      }
      if (legalStatus) {
        query['landDetails.legalStatus'] = legalStatus;
        logger.info(`⚖️ Legal status filter: ${legalStatus}`);
      }
      if (layoutStatus) {
        query['landDetails.layoutStatus'] = layoutStatus;
        logger.info(`📐 Layout status filter: ${layoutStatus}`);
      }
      if (zoningClassification) {
        // Support multi-select: comma-separated values
        const zoningValues = (zoningClassification as string).split(',').map(v => v.trim());
        query['landDetails.zoningClassification'] = { $in: zoningValues };
        logger.info(`🏗️ Zoning classification filter: ${zoningValues.join(', ')}`);
      }
      // Boolean filters for land amenities
      if (boundaryWall === 'true') {
        query['landDetails.boundaryWall'] = true;
        logger.info(`🧱 Boundary wall filter: true`);
      }
      if (waterConnection === 'true') {
        query['landDetails.waterConnection'] = true;
        logger.info(`💧 Water connection filter: true`);
      }
      if (electricityConnection === 'true') {
        query['landDetails.electricityConnection'] = true;
        logger.info(`⚡ Electricity connection filter: true`);
      }
      if (cornerPlot === 'true') {
        query['landDetails.cornerPlot'] = true;
        logger.info(`📍 Corner plot filter: true`);
      }
      if (gatedSecurity === 'true') {
        query['landDetails.gatedSecurity'] = true;
        logger.info(`🔒 Gated security filter: true`);
      }
      // Plot area range filter
      if (minPlotArea || maxPlotArea) {
        query['landDetails.plotArea'] = {};
        if (minPlotArea) {
          query['landDetails.plotArea'].$gte = Number(minPlotArea);
        }
        if (maxPlotArea) {
          query['landDetails.plotArea'].$lte = Number(maxPlotArea);
        }
        logger.info(`📏 Plot area filter: ${minPlotArea || 'any'} - ${maxPlotArea || 'any'} ${areaUnit || 'sqft'}`);
      }
    }
    
    // Lease / Investment filters
    if (tenantType) {
      query['leaseDetails.tenantType'] = tenantType;
      logger.info(`🏢 Tenant type filter: ${tenantType}`);
    }
    if (occupancyStatus) {
      query['leaseDetails.occupancyStatus'] = occupancyStatus;
      logger.info(`🔑 Occupancy status filter: ${occupancyStatus}`);
    }
    if (minRentalYield || maxRentalYield) {
      query['investmentMetrics.rentalYield'] = {};
      if (minRentalYield) {
        query['investmentMetrics.rentalYield'].$gte = Number(minRentalYield);
      }
      if (maxRentalYield) {
        query['investmentMetrics.rentalYield'].$lte = Number(maxRentalYield);
      }
      logger.info(`📈 Rental yield filter: ${minRentalYield || 'any'} - ${maxRentalYield || 'any'}%`);
    }
    if (assetGrade) {
      query['investmentMetrics.assetGrade'] = assetGrade;
      logger.info(`🏅 Asset grade filter: ${assetGrade}`);
    }
    
    // Compliance filters
    if (reraApproved === 'true') {
      query['compliance.reraApproved'] = true;
      logger.info(`✅ RERA approved filter: true`);
    }
    
    // Commercial feature filters
    if (roadFacing === 'true') {
      query['commercialFeatures.roadFacing'] = true;
      logger.info(`🛣️ Road facing filter: true`);
    }
    if (highFootfall === 'true') {
      query['commercialFeatures.highFootfall'] = true;
      logger.info(`👥 High footfall filter: true`);
    }
    if (truckAccess === 'true') {
      query['commercialFeatures.truckAccess'] = true;
      logger.info(`🚛 Truck access filter: true`);
    }
    if (loadingBay === 'true') {
      query['commercialFeatures.loadingBay'] = true;
      logger.info(`📦 Loading bay filter: true`);
    }
    
    // Bedrooms: explicit filter > parsed from search
    if (bedrooms) {
      query['specs.bedrooms'] = Number(bedrooms);
    } else if (parsedSearch.bedrooms) {
      query['specs.bedrooms'] = parsedSearch.bedrooms;
      logger.info(`🛏️ Parsed bedrooms: ${parsedSearch.bedrooms}`);
    }
    
    // Price range filter - Apply affordability if requested
    // Priority: Explicit filter > Parsed from search > User budget (if affordability enabled)
    let effectiveMinPrice = minPrice ? Number(minPrice) : parsedSearch.minPrice;
    let effectiveMaxPrice = maxPrice ? Number(maxPrice) : parsedSearch.maxPrice;
    
    // Validate price values
    if (effectiveMinPrice !== undefined && (isNaN(effectiveMinPrice) || effectiveMinPrice < 0)) {
      logger.warn(`⚠️ Invalid minPrice: ${minPrice}, ignoring`);
      effectiveMinPrice = undefined;
    }
    if (effectiveMaxPrice !== undefined && (isNaN(effectiveMaxPrice) || effectiveMaxPrice < 0)) {
      logger.warn(`⚠️ Invalid maxPrice: ${maxPrice}, ignoring`);
      effectiveMaxPrice = undefined;
    }
    
    // Ensure min <= max
    if (effectiveMinPrice !== undefined && effectiveMaxPrice !== undefined && effectiveMinPrice > effectiveMaxPrice) {
      logger.warn(`⚠️ minPrice (${effectiveMinPrice}) > maxPrice (${effectiveMaxPrice}), swapping`);
      [effectiveMinPrice, effectiveMaxPrice] = [effectiveMaxPrice, effectiveMinPrice];
    }
    
    // Apply affordability filtering based on user preferences if not overridden by explicit/parsed filters
    if (applyAffordability === 'true' && req.user?.userId) {
      try {
        const user = await User.findById(req.user.userId);
        if (user?.preferences?.budget) {
          // Use user's budget preferences if no explicit/parsed price filters provided
          if (effectiveMinPrice === undefined && user.preferences.budget.min) {
            effectiveMinPrice = user.preferences.budget.min;
            logger.info(`💰 Applied user budget min: ${effectiveMinPrice}`);
          }
          if (effectiveMaxPrice === undefined && user.preferences.budget.max) {
            effectiveMaxPrice = user.preferences.budget.max;
            logger.info(`💰 Applied user budget max: ${effectiveMaxPrice}`);
          }
        } else {
          logger.info(`ℹ️ User has no budget preferences saved`);
        }
      } catch (error) {
        logger.error('Error fetching user preferences:', error);
      }
    }
    
    // Apply price filters
    if (effectiveMinPrice !== undefined || effectiveMaxPrice !== undefined) {
      query['pricing.expectedPrice'] = {};
      if (effectiveMinPrice !== undefined) {
        query['pricing.expectedPrice'].$gte = effectiveMinPrice;
      }
      if (effectiveMaxPrice !== undefined) {
        query['pricing.expectedPrice'].$lte = effectiveMaxPrice;
      }
      logger.info(`💵 Price filter applied: ${effectiveMinPrice || 'any'} - ${effectiveMaxPrice || 'any'}`);
    }
    
    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Log query for debugging
    logger.info(`Fetching properties with query: ${JSON.stringify(query)}`);
    
    // Execute query
    const properties = await Property.find(query)
      .populate('owner', 'profile.name email phone role')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get total count
    const total = await Property.countDocuments(query);
    
    logger.info(`Found ${total} properties matching query`);
    
    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
};

// @route   GET /api/v1/properties/:id
// @desc    Get single property by ID
// @access  Public
export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'profile.name email phone role verification.emailVerified');
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    // Check if user can view this property
    const canView = 
      property.status === 'approved' ||
      (req.user && (
        property.owner._id.toString() === req.user.userId ||
        req.user.role === 'admin' ||
        req.user.role === 'agent'
      ));
    
    if (!canView) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this property'
      });
      return;
    }
    
    // Increment view count (only for approved properties)
    if (property.status === 'approved') {
      await property.incrementViews();
    }
    
    res.json({
      success: true,
      data: property
    });
    
  } catch (error: any) {
    logger.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
};

// @route   PATCH /api/v1/properties/:id
// @desc    Update property
// @access  Private (Owner, Agent, Admin)
export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    // Check permissions
    const isOwner = property.owner.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this property'
      });
      return;
    }
    
    // Update property
    Object.assign(property, req.body);
    
    // If owner updates, reset to pending approval (unless already sold/rented)
    if (isOwner && !['sold', 'rented'].includes(property.status)) {
      property.status = 'pending-approval';
    }
    
    await property.save();
    
    logger.info(`Property updated: ${property._id} by ${req.user?.email}`);
    
    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update property error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
};

// @route   DELETE /api/v1/properties/:id
// @desc    Delete property
// @access  Private (Owner, Admin)
export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    // Check permissions
    const isOwner = property.owner.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this property'
      });
      return;
    }
    
    // TODO: Delete images from S3 before deleting property
    // await deleteImagesFromS3(property.images);
    
    await property.deleteOne();
    
    logger.info(`Property deleted: ${req.params.id} by ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
    
  } catch (error: any) {
    logger.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property'
    });
  }
};

// @route   GET /api/v1/properties/my-properties
// @desc    Get current user's properties
// @access  Private
export const getMyProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { owner: req.user?.userId };
    if (status) query.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const properties = await Property.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const total = await Property.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your properties'
    });
  }
};

// @route   PATCH /api/v1/properties/:id/status
// @desc    Update property status (Admin only)
// @access  Private (Admin)
export const updatePropertyStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    property.status = status;
    
    if (status === 'approved') {
      property.verified = true;
      property.verifiedAt = new Date();
      property.verifiedBy = req.user?.userId as any;
      if (!property.publishedAt) {
        property.publishedAt = new Date();
      }
    } else if (status === 'rejected') {
      property.rejectionReason = rejectionReason;
    }
    
    await property.save();
    
    logger.info(`Property status updated: ${property._id} to ${status} by ${req.user?.email}`);
    
    res.json({
      success: true,
      data: property,
      message: `Property ${status} successfully`
    });
    
  } catch (error: any) {
    logger.error('Update property status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property status'
    });
  }
};

// @route   PATCH /api/v1/properties/:id/mark-sold
// @desc    Mark property as sold/rented
// @access  Private (Owner, Admin)
export const markPropertySold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    // Check permissions
    const isOwner = property.owner.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this property'
      });
      return;
    }
    
    property.status = property.listingType === 'sale' ? 'sold' 
      : (property.listingType === 'lease' || property.listingType === 'pre-leased') ? 'leased' 
      : 'rented';
    property.soldAt = new Date();
    
    await property.save();
    
    logger.info(`Property marked as ${property.status}: ${property._id}`);
    
    res.json({
      success: true,
      data: property,
      message: `Property marked as ${property.status}`
    });
    
  } catch (error: any) {
    logger.error('Mark property sold error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
};
