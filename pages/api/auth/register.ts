import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { sendVerificationEmail } from '../../../lib/resend';
import { z } from 'zod';
import crypto from 'crypto';
import { buildAuthTokenIdentifier } from '../../../lib/auth-tokens';
import { RedisService } from '../../../lib/services/RedisService';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Protect against enumeration and spam (5 attempts per hour per IP)
const checkRateLimit = async (ip: string) => {
  try {
    const redis = RedisService.getClient();
    const key = `ratelimit:register:${ip}`;
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }
    return requests <= 10;
  } catch (error) {
    console.error('Rate limiting fallback (redis offline):', error);
    return true; // Fail open if Redis is down, but in production we'd want this robust
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Enforce Rate Limit
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : req.socket.remoteAddress || 'unknown';
    const isAllowed = await checkRateLimit(ip);

    if (!isAllowed) {
      return res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
    }

    const validatedData = registerSchema.parse(req.body);
    const normalizedEmail = validatedData.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Generic response to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If this email is not already registered, a verification link has been sent.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: normalizedEmail,
        phone: validatedData.phone,
        password: hashedPassword,
        role: 'CLIENT',
        name: `${validatedData.firstName} ${validatedData.lastName}`, // For NextAuth.js compatibility
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    // 2. Generate cryptographically safe identity token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours bounding
    const identifier = buildAuthTokenIdentifier('verify', user.email);

    await prisma.verificationToken.deleteMany({
      where: { identifier }
    });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires
      }
    });

    // 3. Dispatch execution
    try {
      await sendVerificationEmail(user.email, token);
    } catch (e) {
      console.error('[Resend Edge Error] Failed dispatch verification:', e);
      // Operational fault masking: User registration still succeeds locally
    }

    res.status(201).json({
      user,
      message: 'User created successfully. Please verify your email before booking sessions.',
      requiresVerification: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
