import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const getOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
};

// Allowed frontend origins for redirect after OAuth
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(o => o.trim());
};

/**
 * @route   GET /api/v1/auth/google
 * @desc    Redirect user to Google OAuth consent screen
 * @access  Public
 */
export const googleAuthRedirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = getOAuth2Client();

    // The origin query param tells us where to redirect after auth
    // e.g., /api/v1/auth/google?origin=https://indiapropertyads.netlify.app
    const origin = (req.query.origin as string) || getAllowedOrigins()[0];

    // Validate origin is in allowed list
    const allowedOrigins = getAllowedOrigins();
    if (!allowedOrigins.includes(origin)) {
      res.status(400).json({
        success: false,
        message: 'Invalid origin. Not in allowed origins list.'
      });
      return;
    }

    // Generate the Google OAuth URL
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
      // Pass the frontend origin in state so we know where to redirect after callback
      state: Buffer.from(JSON.stringify({ origin })).toString('base64'),
    });

    res.redirect(authorizeUrl);
  } catch (error: any) {
    logger.error('Google auth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google sign-in'
    });
  }
};

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Handle Google OAuth callback, create/link user, redirect to frontend with token
 * @access  Public (called by Google)
 */
export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;

    if (!code) {
      res.status(400).json({ success: false, message: 'No authorization code provided' });
      return;
    }

    // Decode the state to get the frontend origin
    let frontendOrigin = getAllowedOrigins()[0];
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state as string, 'base64').toString());
        if (decoded.origin && getAllowedOrigins().includes(decoded.origin)) {
          frontendOrigin = decoded.origin;
        }
      } catch {
        logger.warn('Failed to decode OAuth state, using default origin');
      }
    }

    const client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    // Get user info from Google
    const tokenInfo = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = tokenInfo.getPayload();
    if (!payload || !payload.email) {
      res.redirect(`${frontendOrigin}/login?error=google_no_email`);
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Try to find existing user by googleId or email (auto-link by email)
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    let isNewUser = false;

    if (user) {
      // Existing user — link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture && !user.profile.avatar) {
          user.profile.avatar = picture;
        }
      }
      // Mark email as verified (Google guarantees it)
      user.verification.emailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`Google sign-in (existing user): ${email}`);
    } else {
      // New user — create account
      isNewUser = true;
      user = await User.create({
        email,
        googleId,
        authProvider: 'google',
        profileComplete: false, // Must select role
        role: 'buyer', // Default, will be changed in role selection
        profile: {
          name: name || email.split('@')[0],
          avatar: picture || undefined,
        },
        verification: {
          emailVerified: true, // Google-verified
          phoneVerified: false,
        },
      });

      logger.info(`Google sign-in (new user created): ${email}`);
    }

    // Generate JWT tokens
    const jwtPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Redirect to frontend with tokens and new user flag
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      isNewUser: String(isNewUser || !user.profileComplete),
    });

    res.redirect(`${frontendOrigin}/auth/google/callback?${params.toString()}`);

  } catch (error: any) {
    logger.error('Google auth callback error:', error);

    // Try to redirect to frontend with error
    const frontendOrigin = getAllowedOrigins()[0];
    res.redirect(`${frontendOrigin}/login?error=google_auth_failed`);
  }
};

/**
 * @route   PATCH /api/v1/auth/complete-profile
 * @desc    Complete profile after Google sign-in (set role — mandatory)
 * @access  Private (requires JWT)
 */
export const completeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, phone } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Validate role
    const validRoles = ['buyer', 'owner', 'agent'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Please select a valid role: buyer, owner, or agent'
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Update role and mark profile as complete
    user.role = role;
    user.profileComplete = true;
    if (phone) {
      user.phone = phone;
    }
    await user.save();

    // Generate new tokens with updated role
    const jwtPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    logger.info(`Profile completed for Google user: ${user.email}, role: ${role}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.profile.name,
          avatar: user.profile.avatar,
          emailVerified: user.verification.emailVerified,
          profileComplete: user.profileComplete,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60, // 7 days
        },
      },
      message: 'Profile completed successfully',
    });
  } catch (error: any) {
    logger.error('Complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile',
    });
  }
};
