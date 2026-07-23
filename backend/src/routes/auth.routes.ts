import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// Helper: Send email (Simulated using Ethereal or logging to console)
const sendVerificationEmail = async (email: string, fullName: string, token: string) => {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`;
  
  console.log('\n==================================================');
  console.log(`✉️  [EMAIL SEND - MOCK SMTP]`);
  console.log(`To      : ${fullName} <${email}>`);
  console.log(`Subject : Verify Your Panchayat Account`);
  console.log(`Link    : ${verifyUrl}`);
  console.log('==================================================\n');

  try {
    // Attempt local ethereal or SMTP config if provided, fail silently to console logging
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Digital Panchayat" <no-reply@panchayat.gov.in>',
        to: email,
        subject: 'Verify Your Panchayat Account',
        html: `<p>Hello ${fullName},</p><p>Thank you for registering at Digital Gram Panchayat. Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
    }
  } catch (err) {
    console.error('Real email transport failed, fallback to console log success.');
  }
};

const sendResetEmail = async (email: string, fullName: string, token: string) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/reset-password-page?token=${token}`;
  
  console.log('\n==================================================');
  console.log(`✉️  [RESET PASSWORD EMAIL - MOCK SMTP]`);
  console.log(`To      : ${fullName} <${email}>`);
  console.log(`Subject : Reset Your Panchayat Account Password`);
  console.log(`Token   : ${token}`);
  console.log(`Link    : ${resetUrl}`);
  console.log('==================================================\n');
};

// 1. CITIZEN REGISTRATION
router.post('/register', async (req: Request, res: Response) => {
  const { fullName, phone, email, password, confirmPassword } = req.body;

  if (!fullName || !phone || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
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

    // Create verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'gram_panchayat_super_secure_secret_key_2026_redist', {
      expiresIn: '24h',
    });

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        username,
        role: 'CITIZEN',
        isVerified: true, // Temporary: Auto-verify citizens
        verificationToken,
      },
    });

    // Send verification email
    // await sendVerificationEmail(email, fullName, verificationToken);

    return res.status(201).json({
      message: 'Registration successful! You can now log in.',
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

    // Citizen must verify email before logging in (TEMPORARILY DISABLED)
    // if (user.role === 'CITIZEN' && !user.isVerified) {
    //   return res.status(403).json({
    //     message: 'Your email is not verified. Please check your inbox and verify your email.',
    //     unverified: true,
    //   });
    // }

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
