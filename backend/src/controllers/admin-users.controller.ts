import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import Property from '../models/Property.model';
import Inquiry from '../models/Inquiry.model';
import logger from '../utils/logger';

// @route   GET /api/v1/admin/users/stats
// @desc    Get user management dashboard stats
// @access  Private (Admin)
export const getUserStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      buyers,
      owners,
      agents,
      admins,
      googleUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ authProvider: 'google' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ 'verification.emailVerified': true }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        byRole: { buyers, owners, agents, admins },
        googleUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        recentUsers,
      },
    });
  } catch (error: any) {
    logger.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
};

// @route   GET /api/v1/admin/users
// @desc    List all users with search, filter, pagination
// @access  Private (Admin)
export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      role = '',
      status = '',
      authProvider = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { email: searchRegex },
        { 'profile.name': searchRegex },
        { phone: searchRegex },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;
    else if (status === 'verified') filter['verification.emailVerified'] = true;
    else if (status === 'unverified') filter['verification.emailVerified'] = false;

    if (authProvider && authProvider !== 'all') {
      filter.authProvider = authProvider;
    }

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -verification.emailOTP -verification.emailOTPExpires -resetPasswordToken -resetPasswordExpires')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    logger.error('List users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @route   GET /api/v1/admin/users/:id
// @desc    Get detailed user profile with role-based activity
// @access  Private (Admin)
export const getUserDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -verification.emailOTP -verification.emailOTPExpires -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Fetch role-based activity data in parallel
    const userId = user._id;

    // Common: inquiries as buyer
    const [
      inquiriesAsBuyer,
      inquiriesAsOwner,
      propertiesListed,
      propertiesCount,
      recentInquiries,
    ] = await Promise.all([
      // Inquiries this user made as a buyer
      Inquiry.find({ buyer: userId })
        .populate('property', 'title location.city location.state price propertyType images')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      // Inquiries received (as owner/agent)
      Inquiry.find({ owner: userId })
        .populate('property', 'title location.city location.state price propertyType images')
        .populate('buyer', 'profile.name email phone')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      // Properties listed by this user
      Property.find({ owner: userId })
        .select('title location price propertyType listingType status images createdAt views')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      // Total properties count
      Property.countDocuments({ owner: userId }),
      // Recent inquiry activity (both directions)
      Inquiry.find({ $or: [{ buyer: userId }, { owner: userId }] })
        .populate('property', 'title location.city price')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Compute summary stats
    const inquiryStats = {
      totalSent: inquiriesAsBuyer.length,
      totalReceived: inquiriesAsOwner.length,
      statusBreakdown: {
        new: inquiriesAsOwner.filter((i: any) => i.status === 'new').length,
        contacted: inquiriesAsOwner.filter((i: any) => i.status === 'contacted').length,
        interested: inquiriesAsOwner.filter((i: any) => i.status === 'interested').length,
        siteVisit: inquiriesAsOwner.filter((i: any) => i.status === 'site-visit').length,
        negotiation: inquiriesAsOwner.filter((i: any) => i.status === 'negotiation').length,
        closedWon: inquiriesAsOwner.filter((i: any) => i.status === 'closed-won').length,
        closedLost: inquiriesAsOwner.filter((i: any) => i.status === 'closed-lost').length,
      },
    };

    res.json({
      success: true,
      data: {
        user,
        activity: {
          inquiriesAsBuyer,
          inquiriesAsOwner,
          propertiesListed,
          propertiesCount,
          recentInquiries,
          inquiryStats,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get user detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};

// @route   PATCH /api/v1/admin/users/:id
// @desc    Update user role, status, or other admin-editable fields
// @access  Private (Admin)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (role !== undefined) {
      const validRoles = ['buyer', 'owner', 'agent', 'admin'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid role' });
        return;
      }
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    logger.info(`Admin ${req.user?.email} updated user ${user.email}: role=${user.role}, isActive=${user.isActive}`);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    logger.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// @route   POST /api/v1/admin/users/ensure-super-admin
// @desc    Ensure contact@azentiq.ai is super admin (run once)
// @access  Private (Admin) or startup script
export const ensureSuperAdmin = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const superAdminEmail = 'contact@azentiq.ai';

    const user = await User.findOne({ email: superAdminEmail });

    if (!user) {
      res.status(404).json({
        success: false,
        message: `User ${superAdminEmail} not found. They must register first.`,
      });
      return;
    }

    user.role = 'admin';
    user.isActive = true;
    user.verification.emailVerified = true;
    await user.save();

    logger.info(`Super admin ensured: ${superAdminEmail}`);

    res.json({
      success: true,
      message: `${superAdminEmail} is now super admin`,
      data: {
        email: user.email,
        role: user.role,
        name: user.profile.name,
      },
    });
  } catch (error: any) {
    logger.error('Ensure super admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to set super admin' });
  }
};
