import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Builder from '../models/Builder.model';
import Project from '../models/Project.model';
import User from '../models/User.model';
import logger from '../utils/logger';

// ============================================
// BUILDER REGISTRATION & PROFILE
// ============================================

// @route   POST /api/v1/builders/register
// @desc    Register as a builder/developer
// @access  Private (Owner/Agent)
export const registerBuilder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    // Check if user already has a builder profile
    const existingBuilder = await Builder.findOne({ user: userId });
    if (existingBuilder) {
      res.status(400).json({
        success: false,
        message: 'You already have a builder profile'
      });
      return;
    }
    
    const {
      companyName,
      brandName,
      companyType,
      establishedYear,
      employeeCount,
      rera,
      gst,
      pan,
      contact,
      address,
      about,
      portfolio,
      specialization
    } = req.body;
    
    // Create builder profile
    const builder = await Builder.create({
      user: userId,
      companyName,
      brandName,
      companyType,
      establishedYear,
      employeeCount,
      rera,
      gst,
      pan,
      contact,
      address,
      about,
      portfolio: portfolio || {
        totalProjects: 0,
        completedProjects: 0,
        ongoingProjects: 0,
        upcomingProjects: 0,
        citiesPresent: [address.registered.city]
      },
      specialization: specialization || {
        propertyTypes: ['residential'],
        segments: ['mid-range']
      },
      verification: {
        status: 'pending'
      }
    });
    
    // Update user role to include builder capability
    await User.findByIdAndUpdate(userId, {
      $set: { 'profile.isBuilder': true }
    });
    
    logger.info(`Builder registered: ${companyName} by user ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: builder,
      message: 'Builder profile created successfully. Pending verification.'
    });
    
  } catch (error: any) {
    logger.error('Register builder error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'A builder profile already exists for this account'
      });
      return;
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register builder'
    });
  }
};

// @route   GET /api/v1/builders/me
// @desc    Get current user's builder profile
// @access  Private
export const getMyBuilderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findOne({ user: req.user?.userId })
      .populate('user', 'profile.name email phone');
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder profile not found'
      });
      return;
    }
    
    // Get project counts
    const projectCounts = await Project.aggregate([
      { $match: { builder: builder._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        builder,
        projectCounts: projectCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
    
  } catch (error: any) {
    logger.error('Get builder profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch builder profile'
    });
  }
};

// @route   PATCH /api/v1/builders/me
// @desc    Update builder profile
// @access  Private
export const updateBuilderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findOne({ user: req.user?.userId });
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder profile not found'
      });
      return;
    }
    
    const allowedUpdates = [
      'brandName', 'logo', 'coverImage', 'employeeCount',
      'contact', 'address', 'about', 'portfolio', 'specialization',
      'awards', 'certifications', 'socialMedia'
    ];
    
    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    
    const updatedBuilder = await Builder.findByIdAndUpdate(
      builder._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    logger.info(`Builder profile updated: ${builder.companyName}`);
    
    res.json({
      success: true,
      data: updatedBuilder,
      message: 'Profile updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update builder profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @route   GET /api/v1/builders
// @desc    Get all verified builders (public)
// @access  Public
export const getBuilders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      city,
      state,
      propertyType,
      segment,
      search,
      page = 1,
      limit = 20,
      sortBy = 'portfolio.completedProjects',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = {
      isActive: true,
      'verification.status': 'verified'
    };
    
    if (city) query['address.registered.city'] = { $regex: city, $options: 'i' };
    if (state) query['address.registered.state'] = { $regex: state, $options: 'i' };
    if (propertyType) query['specialization.propertyTypes'] = propertyType;
    if (segment) query['specialization.segments'] = segment;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const builders = await Builder.find(query)
      .select('-salesTeam -verification.documents -gst -pan')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Builder.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        builders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get builders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch builders'
    });
  }
};

// @route   GET /api/v1/builders/:id
// @desc    Get builder by ID (public profile)
// @access  Public
export const getBuilderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findById(req.params.id)
      .select('-salesTeam -verification.documents -gst -pan');
    
    if (!builder || !builder.isActive || builder.verification.status !== 'verified') {
      res.status(404).json({
        success: false,
        message: 'Builder not found'
      });
      return;
    }
    
    // Get builder's projects
    const projects = await Project.find({
      builder: builder._id,
      status: 'approved',
      visibility: 'public'
    })
      .select('name slug projectType segment location.city construction.status details.priceRange media.images')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(10);
    
    // Increment views
    await Builder.findByIdAndUpdate(builder._id, {
      $inc: { 'stats.totalViews': 1 }
    });
    
    res.json({
      success: true,
      data: {
        builder,
        projects
      }
    });
    
  } catch (error: any) {
    logger.error('Get builder by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch builder'
    });
  }
};

// ============================================
// SALES TEAM MANAGEMENT
// ============================================

// @route   POST /api/v1/builders/me/team
// @desc    Add sales team member
// @access  Private (Builder)
export const addTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findOne({ user: req.user?.userId });
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder profile not found'
      });
      return;
    }
    
    const { userId, role, assignedProjects } = req.body;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Check if already in team
    const existingMember = builder.salesTeam?.find(
      m => m.user.toString() === userId
    );
    if (existingMember) {
      res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
      return;
    }
    
    builder.salesTeam = builder.salesTeam || [];
    builder.salesTeam.push({
      user: userId,
      role,
      assignedProjects: assignedProjects || [],
      isActive: true
    });
    
    await builder.save();
    
    logger.info(`Team member added to ${builder.companyName}: ${user.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Team member added successfully'
    });
    
  } catch (error: any) {
    logger.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member'
    });
  }
};

// @route   DELETE /api/v1/builders/me/team/:userId
// @desc    Remove sales team member
// @access  Private (Builder)
export const removeTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findOne({ user: req.user?.userId });
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder profile not found'
      });
      return;
    }
    
    const memberIndex = builder.salesTeam?.findIndex(
      m => m.user.toString() === req.params.userId
    );
    
    if (memberIndex === undefined || memberIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
      return;
    }
    
    builder.salesTeam?.splice(memberIndex, 1);
    await builder.save();
    
    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
    
  } catch (error: any) {
    logger.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member'
    });
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

// @route   GET /api/v1/builders/admin/pending
// @desc    Get pending builder verifications
// @access  Private (Admin)
export const getPendingBuilders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builders = await Builder.find({
      'verification.status': { $in: ['pending', 'under-review'] }
    })
      .populate('user', 'profile.name email phone')
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: builders
    });
    
  } catch (error: any) {
    logger.error('Get pending builders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending builders'
    });
  }
};

// @route   PATCH /api/v1/builders/admin/:id/verify
// @desc    Verify or reject builder
// @access  Private (Admin)
export const verifyBuilder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be verified or rejected'
      });
      return;
    }
    
    const builder = await Builder.findById(req.params.id);
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder not found'
      });
      return;
    }
    
    builder.verification.status = status;
    builder.verification.verifiedAt = new Date();
    builder.verification.verifiedBy = req.user?.userId as any;
    
    if (status === 'rejected' && rejectionReason) {
      builder.verification.rejectionReason = rejectionReason;
    }
    
    await builder.save();
    
    logger.info(`Builder ${status}: ${builder.companyName} by admin ${req.user?.email}`);
    
    res.json({
      success: true,
      message: `Builder ${status} successfully`
    });
    
  } catch (error: any) {
    logger.error('Verify builder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify builder'
    });
  }
};
