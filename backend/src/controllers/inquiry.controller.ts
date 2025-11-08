import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Inquiry from '../models/Inquiry.model';
import Property from '../models/Property.model';
import User from '../models/User.model';
import logger from '../utils/logger';

// @route   POST /api/v1/inquiries
// @desc    Create new inquiry
// @access  Private (Buyer)
export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId, message, contactMethod } = req.body;
    
    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }
    
    // Check if user already sent inquiry for this property
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      buyer: req.user?.userId,
      status: { $in: ['new', 'contacted', 'interested'] }
    });
    
    if (existingInquiry) {
      res.status(400).json({
        success: false,
        message: 'You have already sent an inquiry for this property'
      });
      return;
    }
    
    // Get buyer details from database
    const buyer = await User.findById(req.user?.userId);
    if (!buyer) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Create inquiry
    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user?.userId,
      owner: property.owner,
      message,
      contactMethod,
      buyerInfo: {
        name: buyer.name || 'Unknown',
        email: buyer.email || '',
        phone: buyer.phone || ''
      }
    });
    
    // Increment property inquiries count
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { 'stats.inquiries': 1 }
    });
    
    logger.info(`Inquiry created: ${inquiry._id} by ${req.user?.email} for property ${propertyId}`);
    
    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry sent successfully'
    });
    
  } catch (error: any) {
    logger.error('Create inquiry error:', error);
    
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
      message: 'Failed to send inquiry'
    });
  }
};

// @route   GET /api/v1/inquiries/my-inquiries
// @desc    Get inquiries sent by current user (buyer)
// @access  Private (Buyer)
export const getMyInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { buyer: req.user?.userId };
    if (status) query.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const inquiries = await Inquiry.find(query)
      .populate('property', 'title images address pricing listingType')
      .populate('owner', 'profile.name email phone role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Inquiry.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get my inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
};

// @route   GET /api/v1/inquiries/received
// @desc    Get inquiries received for properties (owner/agent)
// @access  Private (Owner, Agent)
export const getReceivedInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { owner: req.user?.userId };
    if (status) query.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const inquiries = await Inquiry.find(query)
      .populate('property', 'title images address pricing listingType')
      .populate('buyer', 'profile.name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Inquiry.countDocuments(query);
    
    // Get count by status for dashboard
    const statusCounts = await Inquiry.aggregate([
      { $match: { owner: req.user?.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        inquiries,
        statusCounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get received inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
};

// @route   GET /api/v1/inquiries/:id
// @desc    Get single inquiry
// @access  Private (Inquiry owner or property owner)
export const getInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'title images address pricing listingType')
      .populate('buyer', 'profile.name email phone')
      .populate('owner', 'profile.name email phone role');
    
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
      return;
    }
    
    // Check authorization
    const isBuyer = inquiry.buyer._id.toString() === req.user?.userId;
    const isOwner = inquiry.owner._id.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isBuyer && !isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this inquiry'
      });
      return;
    }
    
    res.json({
      success: true,
      data: inquiry
    });
    
  } catch (error: any) {
    logger.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry'
    });
  }
};

// @route   PATCH /api/v1/inquiries/:id
// @desc    Update inquiry status/response
// @access  Private (Property owner/agent)
export const updateInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, response } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
      return;
    }
    
    // Check authorization (only property owner can update)
    if (inquiry.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this inquiry'
      });
      return;
    }
    
    // Update inquiry
    if (status) inquiry.status = status;
    if (response) {
      inquiry.response = response;
      inquiry.respondedAt = new Date();
    }
    
    await inquiry.save();
    
    logger.info(`Inquiry updated: ${inquiry._id} by ${req.user?.email}`);
    
    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry'
    });
  }
};

// @route   DELETE /api/v1/inquiries/:id
// @desc    Delete inquiry
// @access  Private (Buyer or Admin)
export const deleteInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
      return;
    }
    
    // Check authorization (only buyer who created or admin can delete)
    if (inquiry.buyer.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this inquiry'
      });
      return;
    }
    
    await inquiry.deleteOne();
    
    logger.info(`Inquiry deleted: ${inquiry._id} by ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
    
  } catch (error: any) {
    logger.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry'
    });
  }
};
