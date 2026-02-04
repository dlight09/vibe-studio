import { prisma } from '@/lib/db'
import type { AuditAction, Prisma } from '@prisma/client'
import { getSession } from '@/lib/actions/auth'

export async function writeAudit(params: {
  action: AuditAction
  entityType: string
  entityId?: string | null
  metadata?: Prisma.InputJsonValue
}) {
  const session = await getSession()

  // Best-effort auditing; never block core flows.
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        actorUserId: session?.id ?? null,
        actorEmail: session?.email ?? null,
        actorRole: session?.role ?? null,
        metadata: params.metadata,
      },
    })
  } catch {
    // noop
  }
}
