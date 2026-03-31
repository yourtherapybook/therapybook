import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';

export type R2FileType = "PROFILE_PHOTO" | "CERTIFICATION" | "IDENTIFICATION" | "CLINICAL_NOTE";

// MIME type allowlist per file type
export const ALLOWED_MIME_TYPES: Record<R2FileType, string[]> = {
    PROFILE_PHOTO: ['image/jpeg', 'image/png', 'image/webp'],
    CERTIFICATION: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    IDENTIFICATION: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    CLINICAL_NOTE: ['application/pdf'],
};

// Max file sizes in bytes
export const MAX_FILE_SIZES: Record<R2FileType, number> = {
    PROFILE_PHOTO: 4 * 1024 * 1024,   // 4 MB
    CERTIFICATION: 20 * 1024 * 1024,  // 20 MB
    IDENTIFICATION: 20 * 1024 * 1024, // 20 MB
    CLINICAL_NOTE: 20 * 1024 * 1024,  // 20 MB
};

export class StorageService {
    private static getClient() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

        if (!accountId || !accessKeyId || !secretAccessKey) {
            throw new Error('R2 credentials are not configured');
        }

        return new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
        });
    }

    private static getBucket(): string {
        const bucket = process.env.R2_BUCKET_NAME;
        if (!bucket) throw new Error('R2_BUCKET_NAME is not configured');
        return bucket;
    }

    /**
     * Generates a presigned URL for direct Cloudflare R2 uploads.
     */
    static async generatePresignedUrl(userId: string, fileType: R2FileType, mimeType: string) {
        const s3 = this.getClient();
        const bucket = this.getBucket();

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
     * Verifies that a file was actually uploaded to R2 before committing the DB record.
     */
    static async verifyUpload(r2Key: string): Promise<boolean> {
        try {
            const s3 = this.getClient();
            const bucket = this.getBucket();
            await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: r2Key }));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Deletes an object from R2 (e.g. on document rejection).
     */
    static async deleteObject(r2Key: string): Promise<void> {
        const s3 = this.getClient();
        const bucket = this.getBucket();
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: r2Key }));
    }

    /**
     * Generates a presigned download URL for a private object (5-minute expiry).
     */
    static async generateDownloadUrl(r2Key: string, expiresIn = 300): Promise<string> {
        const s3 = this.getClient();
        const bucket = this.getBucket();
        const command = new GetObjectCommand({ Bucket: bucket, Key: r2Key });
        return getSignedUrl(s3, command, { expiresIn });
    }

    /**
     * Commits the Document reference into PostgreSQL after successful client upload.
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
