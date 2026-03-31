import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';
import { sendEmail, APP_URL } from '../../../lib/email';
import { buildAuthTokenIdentifier } from '../../../lib/auth-tokens';
import { authenticateUser } from '../../../lib/auth-middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'You must be signed in to resend verification' });
    }

    // Check if already verified
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, emailVerified: true },
    });

    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (fullUser.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 3600 * 1000);
    const identifier = buildAuthTokenIdentifier('verify', fullUser.email);

    // Clear old tokens and create new one
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    });

    // Send email
    const verifyUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(token)}`;
    await sendEmail(fullUser.email, 'VERIFY_EMAIL', { name: 'there', verifyUrl });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent. Check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
}
