import nodemailer from 'nodemailer';
import logger from './logger';

// Create reusable transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development - use Ethereal Email (fake SMTP)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'your-ethereal-user@ethereal.email',
        pass: 'your-ethereal-password'
      }
    });
  }
};

export const sendVerificationEmail = async (
  to: string,
  otp: string,
  name: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'India Property Ads'} <${process.env.EMAIL_FROM || 'contact@azentiq.ai'}>`,
      to,
      subject: 'Verify Your Email - India Property Ads',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 5px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to India Property Ads!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with India Property Ads. Please use the following One-Time Password (OTP) to verify your email address:</p>
              <div class="otp">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <p>Best regards,<br>India Property Ads Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 India Property Ads. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent: ${info.messageId}`);
    
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  name: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'India Property Ads'} <${process.env.EMAIL_FROM || 'contact@azentiq.ai'}>`,
      to,
      subject: 'Reset Your Password - India Property Ads',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>India Property Ads Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 India Property Ads. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${to}`);
    
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};
