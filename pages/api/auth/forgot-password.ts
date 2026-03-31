import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendEmail, APP_URL } from '../../../lib/email';
import crypto from 'crypto';
import { buildAuthTokenIdentifier } from '../../../lib/auth-tokens';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // Abstracted success return to prevent email enumeration targeting (Security First)
        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account matches this email, a reset link will be sent.' });
        }

        // Cryptographic token generation strictly valid for 1 hour
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600 * 1000);
        const identifier = buildAuthTokenIdentifier('reset', user.email);

        // Expunge previous reset tokens to prevent DB bloat
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

        const resetUrl = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
        await sendEmail(user.email, 'PASSWORD_RESET', { name: user.firstName, resetUrl });

        // Audit log for security visibility
        await prisma.auditLog.create({
            data: {
                action: 'PASSWORD_RESET_REQUESTED',
                userId: user.id,
                entityId: user.id,
                entityType: 'User',
                ipAddress: (typeof req.headers['x-forwarded-for'] === 'string'
                    ? req.headers['x-forwarded-for'].split(',')[0]
                    : req.socket.remoteAddress) || null,
            },
        }).catch(() => { /* non-blocking */ });

        res.status(200).json({ success: true, message: 'If an account matches this email, a reset link will be sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server handler error' });
    }
}
