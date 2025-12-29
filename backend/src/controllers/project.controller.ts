import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Project from '../models/Project.model';
import Builder from '../models/Builder.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// ============================================
// PROJECT CRUD OPERATIONS
// ============================================

// @route   POST /api/v1/projects
// @desc    Create a new project
// @access  Private (Builder)
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get builder profile
    const builder = await Builder.findOne({ user: req.user?.userId });
    
    if (!builder) {
      res.status(403).json({
        success: false,
        message: 'You must have a verified builder profile to create projects'
      });
      return;
    }
    
    if (builder.verification.status !== 'verified') {
      res.status(403).json({
        success: false,
        message: 'Your builder profile must be verified to create projects'
      });
      return;
    }
    
    // Check project limit
    const projectCount = await Project.countDocuments({ builder: builder._id });
    if (projectCount >= builder.subscription.maxProjects) {
      res.status(403).json({
        success: false,
        message: `You have reached your project limit (${builder.subscription.maxProjects}). Please upgrade your plan.`
      });
      return;
    }
    
    const projectData = {
      ...req.body,
      builder: builder._id,
      status: 'draft'
    };
    
    const project = await Project.create(projectData);
    
    // Update builder portfolio
    await Builder.findByIdAndUpdate(builder._id, {
      $inc: { 'portfolio.totalProjects': 1, 'portfolio.ongoingProjects': 1 }
    });
    
    logger.info(`Project created: ${project.name} by builder ${builder.companyName}`);
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
    
  } catch (error: any) {
    logger.error('Create project error:', error);
    
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
      message: 'Failed to create project'
    });
  }
};

// @route   GET /api/v1/projects
// @desc    Get all approved projects (public)
// @access  Public
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      city,
      state,
      locality,
      projectType,
      segment,
      constructionStatus,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      builderId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query: any = {
      status: 'approved',
      visibility: 'public'
    };
    
    // Location filters
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (locality) query['location.locality'] = { $regex: locality, $options: 'i' };
    
    // Type filters
    if (projectType) query.projectType = projectType;
    if (segment) query.segment = segment;
    if (constructionStatus) query['construction.status'] = constructionStatus;
    
    // Price range
    if (minPrice || maxPrice) {
      query['details.priceRange.min'] = {};
      if (minPrice) query['details.priceRange.min'].$gte = Number(minPrice);
      if (maxPrice) query['details.priceRange.max'] = { $lte: Number(maxPrice) };
    }
    
    // Size range
    if (minSize || maxSize) {
      if (minSize) query['details.sizeRange.min'] = { $gte: Number(minSize) };
      if (maxSize) query['details.sizeRange.max'] = { $lte: Number(maxSize) };
    }
    
    // Builder filter
    if (builderId) query.builder = builderId;
    
    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.locality': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const sortOptions: any = {};
    if (sortBy === 'price') {
      sortOptions['details.priceRange.min'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    }
    
    // Featured projects first
    sortOptions.isFeatured = -1;
    
    const projects = await Project.find(query)
      .populate('builder', 'companyName brandName logo')
      .select('-documents -specifications -paymentPlans -seo')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Project.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// @route   GET /api/v1/projects/:idOrSlug
// @desc    Get project by ID or slug (public)
// @access  Public
export const getProjectByIdOrSlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    
    let project;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      project = await Project.findById(idOrSlug)
        .populate('builder', 'companyName brandName logo contact.phone contact.email address.registered.city');
    } else {
      project = await Project.findOne({ slug: idOrSlug })
        .populate('builder', 'companyName brandName logo contact.phone contact.email address.registered.city');
    }
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    // Check visibility
    if (project.status !== 'approved' || project.visibility !== 'public') {
      // Allow builder/admin to view their own projects
      const builder = await Builder.findOne({ user: req.user?.userId });
      const isOwner = builder && project.builder.toString() === (builder._id as any).toString();
      const isAdmin = req.user?.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
    }
    
    // Increment views
    await Project.findByIdAndUpdate(project._id, {
      $inc: { 'stats.views': 1 }
    });
    
    res.json({
      success: true,
      data: project
    });
    
  } catch (error: any) {
    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

// @route   GET /api/v1/projects/builder/me
// @desc    Get current builder's projects
// @access  Private (Builder)
export const getMyProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const builder = await Builder.findOne({ user: req.user?.userId });
    
    if (!builder) {
      res.status(404).json({
        success: false,
        message: 'Builder profile not found'
      });
      return;
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    
    const query: any = { builder: builder._id };
    if (status) query.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Project.countDocuments(query);
    
    // Get status counts
    const statusCounts = await Project.aggregate([
      { $match: { builder: builder._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        projects,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// @route   PATCH /api/v1/projects/:id
// @desc    Update project
// @access  Private (Builder - owner only)
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    // Check ownership
    const builder = await Builder.findOne({ user: req.user?.userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Not authorized to update this project'
        });
        return;
      }
    }
    
    // Don't allow updating certain fields directly
    const { builder: _, status: __, ...updateData } = req.body;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    logger.info(`Project updated: ${project.name}`);
    
    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// @route   PATCH /api/v1/projects/:id/status
// @desc    Update project status (submit for approval, archive)
// @access  Private (Builder)
export const updateProjectStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    // Check ownership
    const builder = await Builder.findOne({ user: req.user?.userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    // Validate status transitions
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['pending-approval', 'archived'],
      'rejected': ['pending-approval', 'archived'],
      'approved': ['archived'],
      'archived': ['draft']
    };
    
    if (!allowedTransitions[project.status]?.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot change status from ${project.status} to ${status}`
      });
      return;
    }
    
    project.status = status;
    if (status === 'pending-approval') {
      project.visibility = 'private';
    }
    
    await project.save();
    
    logger.info(`Project status changed: ${project.name} -> ${status}`);
    
    res.json({
      success: true,
      message: `Project ${status === 'pending-approval' ? 'submitted for approval' : 'status updated'}`
    });
    
  } catch (error: any) {
    logger.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// @route   DELETE /api/v1/projects/:id
// @desc    Delete project (soft delete - archive)
// @access  Private (Builder)
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    // Check ownership
    const builder = await Builder.findOne({ user: req.user?.userId });
    if (!builder || project.builder.toString() !== (builder._id as any).toString()) {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
        return;
      }
    }
    
    // Soft delete - archive
    project.status = 'archived';
    project.visibility = 'private';
    await project.save();
    
    logger.info(`Project archived: ${project.name}`);
    
    res.json({
      success: true,
      message: 'Project archived successfully'
    });
    
  } catch (error: any) {
    logger.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

// @route   GET /api/v1/projects/admin/pending
// @desc    Get pending project approvals
// @access  Private (Admin)
export const getPendingProjects = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({
      status: 'pending-approval'
    })
      .populate('builder', 'companyName brandName verification.status')
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: projects
    });
    
  } catch (error: any) {
    logger.error('Get pending projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending projects'
    });
  }
};

// @route   PATCH /api/v1/projects/admin/:id/approve
// @desc    Approve or reject project
// @access  Private (Admin)
export const approveProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    project.status = status;
    
    if (status === 'approved') {
      project.visibility = 'public';
      project.publishedAt = new Date();
    } else if (status === 'rejected') {
      project.rejectionReason = rejectionReason;
      project.visibility = 'private';
    }
    
    await project.save();
    
    logger.info(`Project ${status}: ${project.name} by admin ${req.user?.email}`);
    
    res.json({
      success: true,
      message: `Project ${status} successfully`
    });
    
  } catch (error: any) {
    logger.error('Approve project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process approval'
    });
  }
};

// @route   PATCH /api/v1/projects/admin/:id/feature
// @desc    Feature/unfeature a project
// @access  Private (Admin)
export const featureProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isFeatured, featuredUntil, featuredOrder } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isFeatured,
          featuredUntil: featuredUntil ? new Date(featuredUntil) : undefined,
          featuredOrder
        }
      },
      { new: true }
    );
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: isFeatured ? 'Project featured' : 'Project unfeatured'
    });
    
  } catch (error: any) {
    logger.error('Feature project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature status'
    });
  }
};

// @route   POST /api/v1/projects/:id/inquiry
// @desc    Submit an inquiry for a project
// @access  Public
export const submitProjectInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, email, message, unitType } = req.body;
    
    if (!name || !phone) {
      res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
      return;
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }
    
    // Increment inquiry count
    await Project.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.inquiries': 1 }
    });
    
    // Create lead in CRM if Lead model exists
    try {
      const Lead = mongoose.model('Lead');
      await Lead.create({
        source: 'project-inquiry',
        sourceDetails: {
          projectId: project._id,
          projectName: project.name,
          unitType
        },
        contact: {
          name,
          phone,
          email
        },
        propertyInterest: {
          type: project.projectType,
          budget: {
            min: project.details.priceRange.min,
            max: project.details.priceRange.max
          },
          preferredLocations: [project.location.city]
        },
        notes: message ? [{ content: message, createdAt: new Date() }] : [],
        assignedTo: project.builder,
        status: 'new'
      });
    } catch (leadError) {
      // Lead model might not exist, log and continue
      logger.warn('Could not create lead from project inquiry:', leadError);
    }
    
    logger.info(`Project inquiry submitted: ${project.name} from ${name} (${phone})`);
    
    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Our team will contact you shortly.'
    });
    
  } catch (error: any) {
    logger.error('Submit project inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry'
    });
  }
};
