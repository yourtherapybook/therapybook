import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { parseAuthTokenIdentifier } from '../../../lib/auth-tokens';

const resetSchema = z.object({
    token: z.string(),
    password: z.string().min(8, 'Password must strictly be at least 8 characters')
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { token, password } = resetSchema.parse(req.body);

        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: 'Session token boundary expired or malformed' });
        }

        const tokenIdentifier = parseAuthTokenIdentifier(verificationToken.identifier);
        if (tokenIdentifier.purpose !== 'reset' && tokenIdentifier.purpose !== 'legacy') {
            return res.status(400).json({ error: 'Token purpose mismatch' });
        }

        const user = await prisma.user.findUnique({
            where: { email: tokenIdentifier.email }
        });

        if (!user) {
            return res.status(404).json({ error: 'Identity bound to token missing' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            }),
            prisma.verificationToken.delete({
                where: { identifier_token: { identifier: verificationToken.identifier, token } }
            }),
            prisma.auditLog.create({
                data: {
                    action: 'PASSWORD_RESET_COMPLETED',
                    userId: user.id,
                    entityId: user.id,
                    entityType: 'User',
                    ipAddress: (typeof req.headers['x-forwarded-for'] === 'string'
                        ? req.headers['x-forwarded-for'].split(',')[0]
                        : req.socket.remoteAddress) || null,
                },
            }),
        ]);

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation constraint violated', details: error.issues });
        }
        console.error('Reset password critical error:', error);
        res.status(500).json({ error: 'Internal server execution fault' });
    }
}
