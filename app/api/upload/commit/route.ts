import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/services/AuthService';
import { StorageService } from '@/lib/services/StorageService';
import { errorResponse, successResponse } from '@/lib/services/ApiResponse';

const commitSchema = z.object({
  r2Key: z.string().min(1),
  fileType: z.enum(["PROFILE_PHOTO", "CERTIFICATION", "IDENTIFICATION", "CLINICAL_NOTE"]),
  title: z.string().min(1),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await AuthService.getPrincipalId();
    const body = await req.json();
    const result = commitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid upload commit payload', result.error.errors),
        { status: 400 }
      );
    }

    // Verify the r2Key belongs to this user (key format: {userId}/{type}/{uuid})
    if (!result.data.r2Key.startsWith(`${userId}/`)) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Invalid file key'),
        { status: 403 }
      );
    }

    // Verify the file actually exists in R2 before writing to DB
    const exists = await StorageService.verifyUpload(result.data.r2Key);
    if (!exists) {
      return NextResponse.json(
        errorResponse('NOT_FOUND', 'File not found in storage — upload may have failed'),
        { status: 404 }
      );
    }

    const document = await StorageService.commitDocumentRecord({
      userId,
      r2Key: result.data.r2Key,
      type: result.data.fileType,
      title: result.data.title,
      size: result.data.size,
      mimeType: result.data.mimeType,
    });

    return NextResponse.json(successResponse({ document }));
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json(errorResponse('UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }

    console.error('Upload commit error:', error);
    return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to finalize upload'), { status: 500 });
  }
}
