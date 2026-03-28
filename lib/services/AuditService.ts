import { prisma } from '../prisma';

export class AuditService {
    /**
     * GDPR Art. 15/20 Compliance: Export all user-related lifecycle records natively.
     */
    static async exportUserData(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                auditLogs: {
                    orderBy: { createdAt: 'desc' }
                },
                documents: true,
                clientSessions: true,
                therapistSessions: true,
                traineeApplication: true,
            }
        });

        if (!user) {
            throw new Error("User not found for data portability request");
        }

        return user;
    }

    /**
     * GDPR Art. 17 Compliance: Securely wipe user PII while preserving anonymized financial/session metadata.
     */
    static async requestErasure(userId: string) {
        // In an enterprise system, this is usually an asynchronous process queued via BullMQ.
        return await prisma.$transaction(async (tx) => {
            // Create final audit entry regarding RTBF (Right to be Forgotten)
            await tx.auditLog.create({
                data: {
                    action: 'GDPR_ERASURE_EXECUTED',
                    entityId: userId,
                    entityType: 'User',
                }
            });

            // Erase raw PII but keep structural session logs for GoBD compliance
            return await tx.user.update({
                where: { id: userId },
                data: {
                    email: `redacted-${Date.now()}@deleted.user`,
                    firstName: 'REDACTED',
                    lastName: 'REDACTED',
                    phone: null,
                    image: null,
                }
            });
        });
    }
}
