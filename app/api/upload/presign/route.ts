import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/services/AuthService';
import { StorageService } from '@/lib/services/StorageService';
import { errorResponse, successResponse } from '@/lib/services/ApiResponse';

const presignSchema = z.object({
    fileType: z.enum(["PROFILE_PHOTO", "CERTIFICATION", "IDENTIFICATION", "CLINICAL_NOTE"]),
    mimeType: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        // 1. Authenticate Request via Service Layer
        const userId = await AuthService.getPrincipalId();

        // 2. Exact Validation
        const body = await req.json();
        const result = presignSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                errorResponse('VALIDATION_ERROR', 'Invalid request body payload', result.error.errors),
                { status: 400 }
            );
        }

        // 3. Delegation to Storage Service
        const { fileType, mimeType } = result.data;
        const presignedData = await StorageService.generatePresignedUrl(userId, fileType, mimeType);

        // 4. Return strictly typed Response
        return NextResponse.json(successResponse(presignedData));
    } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
            return NextResponse.json(errorResponse('UNAUTHORIZED', 'Authentication required'), { status: 401 });
        }
        console.error('Presign API error:', error);
        return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to generate upload URL'), { status: 500 });
    }
}
