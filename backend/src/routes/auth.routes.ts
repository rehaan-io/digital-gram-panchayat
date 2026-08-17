import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// Helper: Send email via Nodemailer/Gmail SMTP
const sendVerificationEmail = async (email: string, fullName: string, token: string) => {
  console.log('[LOG] EMAIL_FUNCTION_ENTERED - Entering sendVerificationEmail via Nodemailer/Gmail');
  const verifyUrl = `https://api.grampanchayat.digital/api/auth/verify-email/${token}`;
  
  console.log('\n==================================================');
  console.log(`✉️  [EMAIL SENDING VIA GMAIL SMTP]`);
  console.log(`To      : ${fullName} <${email}>`);
  console.log(`Subject : Verify Your Panchayat Account`);
  console.log(`Link    : ${verifyUrl}`);
  console.log('==================================================\n');

  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    console.log('[LOG] GMAIL_USER status:', user ? `Loaded (${user})` : 'NOT loaded (undefined/empty)');
    console.log('[LOG] GMAIL_APP_PASSWORD status:', pass ? `Loaded (length: ${pass.length})` : 'NOT loaded (undefined/empty)');

    if (!user || !pass) {
      console.error('[LOG] EMAIL_SENT_FAILURE: Gmail credentials (GMAIL_USER or GMAIL_APP_PASSWORD) are missing in environment variables (.env)');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('[LOG] NODEMAILER_SENDMAIL_CALLED - Dispatching sendMail to Gmail');
    await transporter.sendMail({
      from: `"Digital Panchayat" <${user}>`,
      to: email,
      subject: 'Verify Your Panchayat Account - Gorantla Grama Panchayati',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #FDFBF7;">
          <div style="background-color: #820263; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #FFD400; margin: 0; font-size: 24px; letter-spacing: 2px;">GGP</h2>
            <p style="color: #FFFFFF; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Gorantla Grama Panchayati</p>
          </div>
          <div style="padding: 30px; background-color: #FFFFFF;">
            <h3 style="color: #2E294E; margin-top: 0;">Welcome, ${fullName}!</h3>
            <p style="color: #4A4A4A; line-height: 1.6;">Thank you for registering at the Digital Gram Panchayat portal. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #820263; color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #777777; font-size: 12px; line-height: 1.6;">If the button above does not work, copy and paste the following URL into your web browser:</p>
            <p style="color: #820263; font-size: 12px; word-break: break-all;"><a href="${verifyUrl}" style="color: #820263;">${verifyUrl}</a></p>
          </div>
          <div style="background-color: #F5F5F5; padding: 15px; text-align: center; font-size: 11px; color: #888888; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <p style="margin: 0;">This is an automated system email. Please do not reply directly to this mail.</p>
            <p style="margin: 5px 0 0 0;">&copy; 2026 Gorantla Grama Panchayati. All rights reserved.</p>
          </div>
        </div>
      `
    });

    console.log('[LOG] EMAIL_SENT_SUCCESS - Email sent successfully via Nodemailer/Gmail SMTP.');
  } catch (err: any) {
    console.error('[LOG] EMAIL_SENT_FAILURE: Failed to send verification email via Nodemailer catch block:', err);
  }
};

// Helper: Send password reset email via Nodemailer/Gmail SMTP
const sendResetEmail = async (email: string, fullName: string, token: string) => {
  console.log('[LOG] EMAIL_FUNCTION_ENTERED - Entering sendResetEmail via Nodemailer/Gmail');
  const resetUrl = `https://api.grampanchayat.digital/api/auth/reset-password-page?token=${token}`;
  
  console.log('\n==================================================');
  console.log(`✉️  [EMAIL SENDING VIA GMAIL SMTP]`);
  console.log(`To      : ${fullName} <${email}>`);
  console.log(`Subject : Reset Your Panchayat Account Password`);
  console.log(`Link    : ${resetUrl}`);
  console.log('==================================================\n');

  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    console.log('[LOG] GMAIL_USER status:', user ? `Loaded (${user})` : 'NOT loaded (undefined/empty)');
    console.log('[LOG] GMAIL_APP_PASSWORD status:', pass ? `Loaded (length: ${pass.length})` : 'NOT loaded (undefined/empty)');

    if (!user || !pass) {
      console.error('[LOG] EMAIL_SENT_FAILURE: Gmail credentials (GMAIL_USER or GMAIL_APP_PASSWORD) are missing in environment variables (.env)');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('[LOG] NODEMAILER_SENDMAIL_CALLED - Dispatching sendMail to Gmail');
    await transporter.sendMail({
      from: `"Digital Panchayat" <${user}>`,
      to: email,
      subject: 'Reset Your Panchayat Account Password - Gorantla Grama Panchayati',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #FDFBF7;">
          <div style="background-color: #820263; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #FFD400; margin: 0; font-size: 24px; letter-spacing: 2px;">GGP</h2>
            <p style="color: #FFFFFF; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Gorantla Grama Panchayati</p>
          </div>
          <div style="padding: 30px; background-color: #FFFFFF;">
            <h3 style="color: #2E294E; margin-top: 0;">Hello, ${fullName}!</h3>
            <p style="color: #4A4A4A; line-height: 1.6;">We received a request to reset your password. If you did not make this request, you can ignore this email. Otherwise, click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #820263; color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #777777; font-size: 12px; line-height: 1.6;">If the button above does not work, copy and paste the following URL into your web browser:</p>
            <p style="color: #820263; font-size: 12px; word-break: break-all;"><a href="${resetUrl}" style="color: #820263;">${resetUrl}</a></p>
          </div>
          <div style="background-color: #F5F5F5; padding: 15px; text-align: center; font-size: 11px; color: #888888; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <p style="margin: 0;">This is an automated system email. Please do not reply directly to this mail.</p>
            <p style="margin: 5px 0 0 0;">&copy; 2026 Gorantla Grama Panchayati. All rights reserved.</p>
          </div>
        </div>
      `
    });

    console.log('[LOG] EMAIL_SENT_SUCCESS - Password reset email sent successfully via Nodemailer/Gmail SMTP.');
  } catch (err: any) {
    console.error('[LOG] EMAIL_SENT_FAILURE: Failed to send password reset email via Nodemailer catch block:', err);
  }
};

// 1. CITIZEN REGISTRATION
router.post('/register', async (req: Request, res: Response) => {
  console.log('[LOG] REGISTER_START - Request body:', { fullName: req.body.fullName, email: req.body.email, phone: req.body.phone });
  const { fullName, phone, email, password, confirmPassword } = req.body;

  if (!fullName || !phone || !email || !password || !confirmPassword) {
    console.log('[LOG] REGISTER_FAILED - Missing fields');
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    console.log('[LOG] REGISTER_FAILED - Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    console.log('[LOG] REGISTER_FAILED - Password does not meet complexity requirements');
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.' 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      console.log(`[LOG] REGISTER_FAILED - User already exists with email: ${email} or phone: ${phone}`);
      return res.status(400).json({
        message: 'A user with this email or phone number already exists.',
      });
    }

    // Generate unique username automatically
    const baseUsername = fullName.toLowerCase().replace(/\s+/g, '_').substring(0, 10);
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername}_${uniqueSuffix}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token (crypto random string or just random bytes)
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        username,
        role: 'CITIZEN',
        isVerified: false,
        verificationToken,
      },
    });

    // Send verification email via Nodemailer
    await sendVerificationEmail(email, fullName, verificationToken);

    return res.status(201).json({
      message: 'Registration successful! You can now log in to your account.',
      username: newUser.username,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 2. EMAIL VERIFICATION ENDPOINT
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #FDFBF7;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #D32F2F;">Verification Failed</h1>
              <p>The verification token is invalid or has expired.</p>
            </div>
          </body>
        </html>
      `);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #FDFBF7;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 5px solid #0288D1;">
            <h1 style="color: #0288D1;">Verification Successful!</h1>
            <p>Your email has been verified successfully. You can now close this page and log into the Digital Gram Panchayat app.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    return res.status(500).send('Server Error: ' + error.message);
  }
});

// 3. LOGIN
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employeeProfile: true },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Employee Suspended Check
    if (user.role === 'EMPLOYEE' && !user.isVerified) {
      return res.status(403).json({
        message: 'Your account has been suspended by the administration.',
      });
    }

    // Citizen must verify email before logging in (Bypassed for now)
    /*
    if (user.role === 'CITIZEN' && !user.isVerified) {
      return res.status(403).json({
        message: 'Your email is not verified. Please check your inbox and verify your email.',
        unverified: true,
      });
    }
    */

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'gram_panchayat_super_secure_secret_key_2026_redist',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        employeeId: user.employeeProfile?.employeeId || null,
        employeeUuid: user.employeeProfile?.id || null,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 4. FORGOT PASSWORD
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Generate 6 digit token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Store token as verificationToken temporarily
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: resetToken },
    });

    await sendResetEmail(email, user.fullName, resetToken);

    return res.status(200).json({
      message: 'Password reset code has been sent. Please check your email.',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 5. RESET PASSWORD
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset code or email.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null, // Clear token
      },
    });

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
