import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthTokenIdentifier } from '../../../lib/auth-tokens';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        });

        if (!verificationToken) {
            return res.status(400).json({ error: 'Invalid or malformed verification token' });
        }

        if (verificationToken.expires < new Date()) {
            // Clean up expired deterministic token
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier: verificationToken.identifier, token } }
            });
            return res.status(410).json({ error: 'Token has expired. Please request a new verification email.' });
        }

        const tokenIdentifier = parseAuthTokenIdentifier(verificationToken.identifier);
        if (tokenIdentifier.purpose !== 'verify' && tokenIdentifier.purpose !== 'legacy') {
            return res.status(400).json({ error: 'Token purpose mismatch' });
        }

        const user = await prisma.user.findUnique({
            where: { email: tokenIdentifier.email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User associated with this token no longer exists' });
        }

        // Atomic verify and cleanup
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            }),
            prisma.verificationToken.delete({
                where: { identifier_token: { identifier: verificationToken.identifier, token } }
            })
        ]);

        res.status(200).json({ success: true, message: 'Email successfully verified' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error while resolving verification block' });
    }
}
