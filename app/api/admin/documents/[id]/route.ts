import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';
import { StorageService } from '@/lib/services/StorageService';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status. Must be VERIFIED or REJECTED.' },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updatedDocument = await TransactionService.executeWithAudit(
      'ADMIN_DOCUMENT_REVIEW',
      session.user.id,
      'Document',
      async (tx: any) => {
        const updated = await tx.document.update({
          where: { id },
          data: { status: parsed.data.status },
        });

        return {
          entityId: id,
          payload: {
            previousStatus: document.status,
            newStatus: parsed.data.status,
            documentType: document.type,
            userId: document.userId,
          },
          returnedData: updated,
        };
      }
    );

    // Delete the R2 object if rejected — no point keeping rejected files
    if (parsed.data.status === 'REJECTED') {
      await StorageService.deleteObject(document.r2Key).catch((err) =>
        console.error(`[storage] Failed to delete R2 object ${document.r2Key}:`, err)
      );
    }

    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error('Document review error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// GET a presigned download URL for a specific document (admin only)
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const url = await StorageService.generateDownloadUrl(document.r2Key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Document download URL error:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
