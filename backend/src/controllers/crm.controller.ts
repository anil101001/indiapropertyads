import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Inquiry from '../models/Inquiry.model';
import Activity from '../models/Activity.model';
import Task from '../models/Task.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// ============================================
// LEAD/INQUIRY CRM ENDPOINTS
// ============================================

// @route   GET /api/v1/crm/leads
// @desc    Get all leads for seller with CRM data
// @access  Private (Owner, Agent)
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      status, 
      priority, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;
    
    const query: any = { owner: req.user?.userId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Search by buyer name, email, or phone
    if (search) {
      query.$or = [
        { 'buyerInfo.name': { $regex: search, $options: 'i' } },
        { 'buyerInfo.email': { $regex: search, $options: 'i' } },
        { 'buyerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const leads = await Inquiry.find(query)
      .populate('property', 'title images address pricing listingType propertyType')
      .populate('buyer', 'profile.name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Inquiry.countDocuments(query);
    
    // Get counts by status for pipeline view
    const statusCounts = await Inquiry.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user?.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get counts by priority
    const priorityCounts = await Inquiry.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user?.userId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Get upcoming follow-ups count
    const upcomingFollowUps = await Inquiry.countDocuments({
      owner: req.user?.userId,
      nextFollowUpDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // Next 24 hours
      status: { $nin: ['closed-won', 'closed-lost'] }
    });
    
    res.json({
      success: true,
      data: {
        leads,
        stats: {
          statusCounts: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {} as Record<string, number>),
          priorityCounts: priorityCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {} as Record<string, number>),
          upcomingFollowUps
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get CRM leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
};

// @route   GET /api/v1/crm/leads/:id
// @desc    Get single lead with full CRM details
// @access  Private (Owner)
export const getLeadDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Inquiry.findById(req.params.id)
      .populate('property', 'title images address pricing listingType propertyType specs')
      .populate('buyer', 'profile.name email phone');
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    // Check authorization
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this lead'
      });
      return;
    }
    
    // Get activities for this lead
    const activities = await Activity.find({ inquiry: lead._id })
      .populate('user', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get tasks for this lead
    const tasks = await Task.find({ inquiry: lead._id })
      .populate('assignedTo', 'profile.name')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      data: {
        lead,
        activities,
        tasks
      }
    });
    
  } catch (error: any) {
    logger.error('Get lead details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead details'
    });
  }
};

// @route   PATCH /api/v1/crm/leads/:id
// @desc    Update lead CRM fields
// @access  Private (Owner)
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      status, 
      priority, 
      nextFollowUpDate, 
      expectedClosingDate,
      notes,
      tags,
      budget
    } = req.body;
    
    const lead = await Inquiry.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    // Check authorization
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
      return;
    }
    
    const oldStatus = lead.status;
    
    // Update fields
    if (status) lead.status = status;
    if (priority) lead.priority = priority;
    if (nextFollowUpDate) lead.nextFollowUpDate = new Date(nextFollowUpDate);
    if (expectedClosingDate) lead.expectedClosingDate = new Date(expectedClosingDate);
    if (notes !== undefined) lead.notes = notes;
    if (tags) lead.tags = tags;
    if (budget) lead.budget = budget;
    
    await lead.save();
    
    // Log status change as activity
    if (status && status !== oldStatus) {
      await Activity.create({
        inquiry: lead._id,
        user: req.user?.userId,
        type: 'status-change',
        title: `Status changed from ${oldStatus} to ${status}`,
        statusChange: {
          from: oldStatus,
          to: status
        }
      });
    }
    
    logger.info(`Lead updated: ${lead._id} by ${req.user?.email}`);
    
    res.json({
      success: true,
      data: lead,
      message: 'Lead updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead'
    });
  }
};

// @route   PATCH /api/v1/crm/leads/:id/status
// @desc    Quick status update (for drag-drop in Kanban)
// @access  Private (Owner)
export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    const lead = await Inquiry.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    const oldStatus = lead.status;
    lead.status = status;
    
    // Update lastContactedAt if moving from 'new'
    if (oldStatus === 'new' && status !== 'new') {
      lead.lastContactedAt = new Date();
    }
    
    await lead.save();
    
    // Log activity
    await Activity.create({
      inquiry: lead._id,
      user: req.user?.userId,
      type: 'status-change',
      title: `Status changed from ${oldStatus} to ${status}`,
      statusChange: { from: oldStatus, to: status }
    });
    
    res.json({
      success: true,
      data: lead
    });
    
  } catch (error: any) {
    logger.error('Update lead status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// ============================================
// ACTIVITY ENDPOINTS
// ============================================

// @route   POST /api/v1/crm/leads/:id/activities
// @desc    Add activity to a lead
// @access  Private (Owner)
export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, title, description, callDetails, siteVisitDetails } = req.body;
    
    const lead = await Inquiry.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    const activity = await Activity.create({
      inquiry: lead._id,
      user: req.user?.userId,
      type,
      title,
      description,
      callDetails,
      siteVisitDetails
    });
    
    // Update lastContactedAt on lead
    if (['call', 'email', 'sms', 'whatsapp', 'meeting'].includes(type)) {
      lead.lastContactedAt = new Date();
      await lead.save();
    }
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('user', 'profile.name');
    
    logger.info(`Activity added to lead ${lead._id}: ${type}`);
    
    res.status(201).json({
      success: true,
      data: populatedActivity,
      message: 'Activity added successfully'
    });
    
  } catch (error: any) {
    logger.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add activity'
    });
  }
};

// @route   GET /api/v1/crm/leads/:id/activities
// @desc    Get activities for a lead
// @access  Private (Owner)
export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const lead = await Inquiry.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const activities = await Activity.find({ inquiry: lead._id })
      .populate('user', 'profile.name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Activity.countDocuments({ inquiry: lead._id });
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

// ============================================
// TASK ENDPOINTS
// ============================================

// @route   POST /api/v1/crm/leads/:id/tasks
// @desc    Create task for a lead
// @access  Private (Owner)
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, type, priority, dueDate, reminderDate, assignedTo } = req.body;
    
    const lead = await Inquiry.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    if (lead.owner.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    const task = await Task.create({
      inquiry: lead._id,
      user: req.user?.userId,
      assignedTo: assignedTo || req.user?.userId,
      title,
      description,
      type,
      priority,
      dueDate: new Date(dueDate),
      reminderDate: reminderDate ? new Date(reminderDate) : undefined
    });
    
    // Update nextFollowUpDate on lead if this is a follow-up task
    if (type === 'follow-up' && (!lead.nextFollowUpDate || new Date(dueDate) < lead.nextFollowUpDate)) {
      lead.nextFollowUpDate = new Date(dueDate);
      await lead.save();
    }
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'profile.name');
    
    logger.info(`Task created for lead ${lead._id}: ${title}`);
    
    res.status(201).json({
      success: true,
      data: populatedTask,
      message: 'Task created successfully'
    });
    
  } catch (error: any) {
    logger.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// @route   GET /api/v1/crm/tasks
// @desc    Get all tasks for current user
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, page = 1, limit = 50 } = req.query;
    
    const query: any = {
      $or: [
        { user: req.user?.userId },
        { assignedTo: req.user?.userId }
      ]
    };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const tasks = await Task.find(query)
      .populate('inquiry', 'buyerInfo property status')
      .populate('assignedTo', 'profile.name')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Task.countDocuments(query);
    
    // Get overdue count
    const overdueCount = await Task.countDocuments({
      ...query,
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $lt: new Date() }
    });
    
    // Get due today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueTodayCount = await Task.countDocuments({
      ...query,
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $gte: today, $lt: tomorrow }
    });
    
    res.json({
      success: true,
      data: {
        tasks,
        stats: {
          overdueCount,
          dueTodayCount
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// @route   PATCH /api/v1/crm/tasks/:id
// @desc    Update task
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, type, priority, dueDate, reminderDate, status } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }
    
    // Check authorization
    const isOwner = task.user.toString() === req.user?.userId;
    const isAssignee = task.assignedTo?.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isOwner && !isAssignee && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (type) task.type = type;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (reminderDate) task.reminderDate = new Date(reminderDate);
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
    }
    
    await task.save();
    
    // Log activity if task completed
    if (status === 'completed') {
      await Activity.create({
        inquiry: task.inquiry,
        user: req.user?.userId,
        type: 'follow-up',
        title: `Task completed: ${task.title}`
      });
    }
    
    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// @route   DELETE /api/v1/crm/tasks/:id
// @desc    Delete task
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }
    
    if (task.user.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
      return;
    }
    
    await task.deleteOne();
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
    
  } catch (error: any) {
    logger.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// ============================================
// DASHBOARD STATS
// ============================================

// @route   GET /api/v1/crm/dashboard
// @desc    Get CRM dashboard stats
// @access  Private (Owner, Agent)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    // Lead stats by status
    const leadsByStatus = await Inquiry.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Total leads
    const totalLeads = await Inquiry.countDocuments({ owner: userId });
    
    // New leads (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newLeadsThisWeek = await Inquiry.countDocuments({
      owner: userId,
      createdAt: { $gte: weekAgo }
    });
    
    // Pending follow-ups (overdue + due today)
    const pendingFollowUps = await Inquiry.countDocuments({
      owner: userId,
      nextFollowUpDate: { $lte: new Date() },
      status: { $nin: ['closed-won', 'closed-lost'] }
    });
    
    // Pending tasks
    const pendingTasks = await Task.countDocuments({
      $or: [{ user: userId }, { assignedTo: userId }],
      status: { $in: ['pending', 'in-progress'] }
    });
    
    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      $or: [{ user: userId }, { assignedTo: userId }],
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $lt: new Date() }
    });
    
    // Conversion rate (closed-won / total closed)
    const closedWon = leadsByStatus.find(s => s._id === 'closed-won')?.count || 0;
    const closedLost = leadsByStatus.find(s => s._id === 'closed-lost')?.count || 0;
    const totalClosed = closedWon + closedLost;
    const conversionRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;
    
    // Recent activities
    const recentActivities = await Activity.find({
      user: userId
    })
      .populate('inquiry', 'buyerInfo')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalLeads,
          newLeadsThisWeek,
          pendingFollowUps,
          pendingTasks,
          overdueTasks,
          conversionRate
        },
        leadsByStatus: leadsByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        recentActivities
      }
    });
    
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};
