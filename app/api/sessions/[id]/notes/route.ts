import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
});

const lockNoteSchema = z.object({
  noteId: z.string().cuid(),
});

/**
 * GET: Fetch all notes for a session.
 * - Therapist (session owner) can always read
 * - Supervisor (assigned to therapist) can read
 * - Admin can read
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await context.params;
    const userId = session.user.id;
    const role = session.user.role;

    // Find the session
    const therapySession = await prisma.session.findUnique({
      where: { id },
      select: { therapistId: true, clientId: true },
    });

    if (!therapySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Permission check: therapist, supervisor of therapist, or admin
    const isTherapist = therapySession.therapistId === userId;
    const isAdmin = role === 'ADMIN';

    let isSupervisor = false;
    if (role === 'SUPERVISOR') {
      const assignment = await prisma.supervisorAssignment.findFirst({
        where: {
          supervisorId: userId,
          traineeId: therapySession.therapistId,
          isActive: true,
        },
      });
      isSupervisor = !!assignment;
    }

    if (!isTherapist && !isSupervisor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notes = await prisma.sessionNote.findMany({
      where: { sessionId: id },
      include: {
        author: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Session notes fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

/**
 * POST: Add a new note to a session (append-only).
 * - Only the therapist (session owner) or admin can add notes.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = addNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid note content' }, { status: 400 });
    }

    const therapySession = await prisma.session.findUnique({
      where: { id },
      select: { therapistId: true },
    });

    if (!therapySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const isTherapist = therapySession.therapistId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isTherapist && !isAdmin) {
      return NextResponse.json({ error: 'Only the therapist or admin can add notes' }, { status: 403 });
    }

    const note = await prisma.sessionNote.create({
      data: {
        sessionId: id,
        authorId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    // Also update the legacy notes field for backward compatibility
    await prisma.session.update({
      where: { id },
      data: { notes: parsed.data.content },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Session note creation error:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}

/**
 * PATCH: Lock a note (sign off — no further edits possible).
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = lockNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const note = await prisma.sessionNote.findUnique({
      where: { id: parsed.data.noteId },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only the note author can lock it
    if (note.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only the note author can lock it' }, { status: 403 });
    }

    if (note.isLocked) {
      return NextResponse.json({ error: 'Note is already locked' }, { status: 400 });
    }

    const locked = await prisma.sessionNote.update({
      where: { id: parsed.data.noteId },
      data: { isLocked: true },
    });

    return NextResponse.json({ note: locked });
  } catch (error) {
    console.error('Note lock error:', error);
    return NextResponse.json({ error: 'Failed to lock note' }, { status: 500 });
  }
}
