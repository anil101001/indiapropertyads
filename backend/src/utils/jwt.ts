import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  
  // @ts-ignore - JWT expiresIn typing issue
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  // @ts-ignore - JWT expiresIn typing issue
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};
