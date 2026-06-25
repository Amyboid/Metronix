// lib/server/audit.ts
import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';

export async function writeAuditLog(params: {
    adminId:    string;
    adminEmail: string;
    action:     string;
    entityType: string;
    entityId:   string;
    entityName: string;
}) {
    await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        ...params,
    });
}