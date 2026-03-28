import { Queue, QueueEvents } from 'bullmq';
import { RedisService } from '../services/RedisService';

const connection = RedisService.getClient();

export const notificationQueue = new Queue('Notifications', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    }
});

// Optional: Global queue event listeners for logging
export const notificationQueueEvents = new QueueEvents('Notifications', { connection });

notificationQueueEvents.on('completed', ({ jobId }) => {
    console.log(`[NotificationQueue] Job ${jobId} completed successfully.`);
});

notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`[NotificationQueue] Job ${jobId} failed:`, failedReason);
});
