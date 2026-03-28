import { Worker } from 'bullmq';
import { RedisService } from '../../services/RedisService';
import { prisma } from '../../prisma';
import { sendTransactionalEmail } from '../../resend';

const connection = RedisService.getClient();

type NotificationPayload = {
    subject?: string;
    html?: string;
    message?: string;
    from?: string;
};

/**
 * Specialized background hook for Supervisor notifications and System Audits
 */
export const createNotificationWorker = () => {
    return new Worker(
        'Notifications',
        async (job) => {
            console.log(`[Worker] Processing notification job ${job.id}:`, job.name);

            const { entityId, entityType, action, destinationEmail, payload } = job.data as {
                entityId: string;
                entityType: string;
                action: string;
                destinationEmail?: string;
                payload?: NotificationPayload;
                userId?: string | null;
            };

            // 1. Audit Logging (GoBD compliance) via background worker offload
            await prisma.auditLog.create({
                data: {
                    action,
                    entityId,
                    entityType,
                    details: payload,
                    userId: job.data.userId || null,
                    // Note: system events won't have userId
                }
            });

            // 2. Transactional Email Dispatch
            if (destinationEmail && payload?.subject) {
                const html = payload.html || `<p>${payload.message || `${job.name} notification`}</p>`;

                await sendTransactionalEmail({
                    from: payload.from || 'TherapyBook <noreply@therapybook.com>',
                    to: destinationEmail,
                    subject: payload.subject,
                    html,
                });
            }

            return { success: true, processedAt: new Date().toISOString() };
        },
        {
            connection,
            concurrency: 5
        }
    );
};
