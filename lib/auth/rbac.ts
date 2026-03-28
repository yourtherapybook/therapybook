import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth';

export class UnauthorizedError extends Error {
    code = 'UNAUTHORIZED';
    constructor(message = 'You must be logged in.') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    code = 'FORBIDDEN';
    constructor(message = 'You do not have the required permissions.') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/**
 * Service-level RBAC enforcement logic.
 * Throws standard Errors to be caught by the API route handlers.
 */
export async function enforceRole(allowedRoles: UserRole[]) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new UnauthorizedError();
    }

    const userRole = session.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError(`Role ${userRole} is not permitted access.`);
    }

    return session.user;
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user || null;
}
