import { prisma } from '../prisma';

export class TransactionService {
    /**
     * Executes deeply isolated Prisma queries with an atomic GoBD-compliant AuditLog insertion.
     * If the operation fails, the Audit insertion never leaves an orphaned trace.
     */
    static async executeWithAudit<T>(
        action: string,
        aktorUserId: string | null,
        entityType: string,
        operation: (tx: any) => Promise<{ entityId: string, payload?: any, returnedData: T }>
    ) {
        return await prisma.$transaction(async (tx) => {
            // 1. Execute volatile operation
            const result = await operation(tx);

            // 2. Safely capture the before/after state
            await tx.auditLog.create({
                data: {
                    action,
                    userId: aktorUserId,
                    entityId: result.entityId,
                    entityType,
                    details: result.payload ? JSON.parse(JSON.stringify(result.payload)) : null
                }
            });

            return result.returnedData;
        });
    }
}
