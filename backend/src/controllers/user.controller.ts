import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import logger from '../utils/logger';

// @route   GET /api/v1/users/me
// @desc    Get current user profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// @route   PATCH /api/v1/users/me
// @desc    Update user profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profile } = req.body;
    
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Update profile fields
    if (profile) {
      if (profile.name) user.profile.name = profile.name;
      if (profile.avatar) user.profile.avatar = profile.avatar;
      if (profile.location) {
        user.profile.location = {
          ...user.profile.location,
          ...profile.location
        };
      }
    }
    
    await user.save();
    
    logger.info(`Profile updated for user: ${user.email}`);
    
    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
    
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};
