import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Property from '../models/Property.model';
import logger from '../utils/logger';

// @route   POST /api/v1/properties
// @desc    Create new property
// @access  Private (Owner, Agent)
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user?.userId
    };
    
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
      q // Support both 'search' and 'q' parameters
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
    const searchTerm = (search || q) as string;
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.landmark': searchRegex },
        { 'address.fullAddress': searchRegex }
      ];
      logger.info(`🔍 Text search: "${searchTerm}"`);
    }
    
    if (city) query['address.city'] = new RegExp(city as string, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (bedrooms) query['specs.bedrooms'] = Number(bedrooms);
    
    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.expectedPrice'] = {};
      if (minPrice) query['pricing.expectedPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.expectedPrice'].$lte = Number(maxPrice);
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
    
    property.status = property.listingType === 'sale' ? 'sold' : 'rented';
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
