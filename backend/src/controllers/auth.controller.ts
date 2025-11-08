import { Request, Response } from 'express';
import User from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';
import logger from '../utils/logger';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, phone, role, profile } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });
    
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
      });
      return;
    }
    
    // Generate OTP
    const emailOTP = generateOTP();
    const emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user
    const user = await User.create({
      email,
      password,
      phone,
      role: role || 'buyer',
      profile: {
        name: profile.name,
        ...(profile.location && { location: profile.location })
      },
      verification: {
        emailOTP,
        emailOTPExpires,
        emailVerified: false,
        phoneVerified: false
      }
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, emailOTP, profile.name);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Continue anyway - user can request new OTP
    }
    
    logger.info(`New user registered: ${email}`);
    
    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.verification.emailVerified,
        phoneVerified: user.verification.phoneVerified
      },
      message: 'Registration successful. Please check your email for verification code.'
    });
    
  } catch (error: any) {
    logger.error('Register error:', error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed',
        errors: messages
      });
      return;
    }
    
    // Handle duplicate key errors (unique constraints)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' 
        ? 'Email already registered' 
        : field === 'phone'
        ? 'Phone number already registered'
        : 'This value is already in use';
      
      res.status(400).json({
        success: false,
        message
      });
      return;
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   POST /api/v1/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    if (user.verification.emailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
      return;
    }
    
    // Check OTP
    if (user.verification.emailOTP !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }
    
    // Check if OTP expired
    if (user.verification.emailOTPExpires && user.verification.emailOTPExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
      return;
    }
    
    // Mark email as verified
    user.verification.emailVerified = true;
    user.verification.emailOTP = undefined;
    user.verification.emailOTPExpires = undefined;
    await user.save();
    
    logger.info(`Email verified: ${email}`);
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error: any) {
    logger.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
};

// @route   POST /api/v1/auth/resend-otp
// @desc    Resend OTP
// @access  Public
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    if (user.verification.emailVerified) {
      res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
      return;
    }
    
    // Generate new OTP
    const emailOTP = generateOTP();
    const emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    user.verification.emailOTP = emailOTP;
    user.verification.emailOTPExpires = emailOTPExpires;
    await user.save();
    
    // Send email
    await sendVerificationEmail(email, emailOTP, user.profile.name);
    
    res.json({
      success: true,
      message: 'New OTP sent to your email'
    });
    
  } catch (error: any) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }
    
    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
      return;
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }
    
    // Generate tokens
    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    
    logger.info(`User logged in: ${email}`);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.profile.name,
          avatar: user.profile.avatar,
          emailVerified: user.verification.emailVerified
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 15 * 60 // 7 days or 15 min
        }
      }
    });
    
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
      return;
    }
    
    // Extract only user data (exclude JWT metadata like exp, iat)
    const userPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
    
    // Generate new access token with clean payload
    const accessToken = generateAccessToken(userPayload);
    
    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 15 * 60 // 15 minutes
      }
    });
    
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset link
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
      return;
    }
    
    // Generate reset token (in production, use crypto.randomBytes)
    // const resetToken = generateOTP();
    // const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token (we'll add this field to schema later)
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = resetTokenExpires;
    // await user.save();
    
    // Send email with reset link
    // await sendPasswordResetEmail(email, resetToken);
    
    logger.info(`Password reset requested for: ${email}`);
    
    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
    
  } catch (error: any) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
};

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, you'd invalidate the token in Redis/database
    // For now, client will just delete the token
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
