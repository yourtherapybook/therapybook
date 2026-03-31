import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/services/AuthService';
import { StorageService, ALLOWED_MIME_TYPES, MAX_FILE_SIZES, type R2FileType } from '@/lib/services/StorageService';
import { errorResponse, successResponse } from '@/lib/services/ApiResponse';

const presignSchema = z.object({
    fileType: z.enum(["PROFILE_PHOTO", "CERTIFICATION", "IDENTIFICATION", "CLINICAL_NOTE"]),
    mimeType: z.string().min(1),
    size: z.number().int().positive(),
});

export async function POST(req: Request) {
    try {
        const userId = await AuthService.getPrincipalId();

        const body = await req.json();
        const result = presignSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                errorResponse('VALIDATION_ERROR', 'Invalid request body payload', result.error.errors),
                { status: 400 }
            );
        }

        const { fileType, mimeType, size } = result.data;

        // Enforce MIME type allowlist
        const allowedTypes = ALLOWED_MIME_TYPES[fileType as R2FileType];
        if (!allowedTypes.includes(mimeType)) {
            return NextResponse.json(
                errorResponse('VALIDATION_ERROR', `File type not allowed for ${fileType}. Allowed: ${allowedTypes.join(', ')}`),
                { status: 400 }
            );
        }

        // Enforce file size limit
        const maxSize = MAX_FILE_SIZES[fileType as R2FileType];
        if (size > maxSize) {
            return NextResponse.json(
                errorResponse('VALIDATION_ERROR', `File too large. Max size for ${fileType}: ${Math.round(maxSize / 1024 / 1024)}MB`),
                { status: 400 }
            );
        }

        const presignedData = await StorageService.generatePresignedUrl(userId, fileType as R2FileType, mimeType);
        return NextResponse.json(successResponse(presignedData));
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
            return NextResponse.json(errorResponse('UNAUTHORIZED', 'Authentication required'), { status: 401 });
        }
        console.error('Presign API error:', error);
        return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to generate upload URL'), { status: 500 });
    }
}
