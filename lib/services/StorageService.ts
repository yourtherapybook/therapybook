import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';

export class StorageService {
    private static getClient() {
        return new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
            },
        });
    }

    /**
     * Generates a deterministic presigned URL for direct Cloudflare R2 uploads.
     */
    static async generatePresignedUrl(userId: string, fileType: "PROFILE_PHOTO" | "CERTIFICATION" | "IDENTIFICATION" | "CLINICAL_NOTE", mimeType: string) {
        const s3 = this.getClient();
        const bucket = process.env.R2_BUCKET_NAME || 'therapybook-documents';

        // Create a deterministic isolation path: /{userId}/{type}/{uuid}
        const fileId = uuidv4();
        const r2Key = `${userId}/${fileType.toLowerCase()}/${fileId}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: r2Key,
            ContentType: mimeType,
        });

        // URL valid for 5 minutes
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        // Return the signed URL and the permanent reference ID to save later.
        return {
            uploadUrl: signedUrl,
            r2Key,
            fileId,
            publicUrl: `${process.env.NEXT_PUBLIC_R2_DEV_URL}/${r2Key}`
        };
    }

    /**
     * Commits the Document reference into PostgreSQL after successful client upload upload.
     */
    static async commitDocumentRecord(data: { userId: string, r2Key: string, type: any, title: string, size: number, mimeType: string }) {
        return await prisma.document.upsert({
            where: { r2Key: data.r2Key },
            update: {
                title: data.title,
                size: data.size,
                mimeType: data.mimeType,
                type: data.type,
                userId: data.userId,
            },
            create: {
                userId: data.userId,
                r2Key: data.r2Key,
                type: data.type,
                title: data.title,
                size: data.size,
                mimeType: data.mimeType,
                status: 'PENDING'
            }
        });
    }
}
