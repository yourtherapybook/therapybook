import { getCurrentUser, enforceRole, UnauthorizedError, ForbiddenError } from '../auth/rbac';
import { UserRole } from '@prisma/client';

export class AuthService {
    /**
     * Evaluates if the system can proceed with an action based on context roles.
     */
    static async validateAccess(allowedRoles: UserRole[]) {
        return await enforceRole(allowedRoles);
    }

    /**
     * Retrieves the current principal ID from context safely.
     */
    static async getPrincipalId() {
        const user = await getCurrentUser();
        if (!user) throw new UnauthorizedError();
        return user.id;
    }
}
