# Audit Logging

Document ID: VS-ARCH-AUDIT

Version: 0.1

Status: Draft

Last updated: 2026-02-05

## Purpose

Audit events support operational accountability and debugging.

## Model

- AuditLog: time-ordered events
- AuditAction: enumerated action types

Key fields:
- actorUserId/actorEmail/actorRole
- entityType/entityId
- metadata (JSON)

## Write Strategy

- Best-effort: logging must never block the primary operation.
- Writes happen from server actions through `lib/audit.ts:writeAudit()`.

## Viewer

- `app/admin/audit/page.tsx` lists the latest 200 events.

## Known Gaps (Production)

- No retention policy (e.g., 90 days) defined.
- No export tooling.
- No tamper-evidence (e.g., append-only storage) beyond DB controls.
