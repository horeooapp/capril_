"use server"

import { writeAuditLog } from "@/lib/audit";

export async function logCriticalAction(data: {
    action: string,
    module: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any
}) {
    return await writeAuditLog({
        ...data
    });
}
