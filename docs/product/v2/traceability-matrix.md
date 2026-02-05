# Traceability Matrix (V2)

Document ID: VS-TRACE-V2

Version: 0.1

Status: Draft

Last updated: 2026-02-05

This matrix links requirements -> stories -> implementation -> tests.

## Legend

- Req: `docs/product/v2/requirements.md`
- Stories: `docs/product/v2/user-stories.md`
- V2 acceptance: `docs/v2-acceptance.md`

## Matrix

| Requirement | User story | Implementation | Tests |
|---|---|---|---|
| REQ-M-101 | US-M-101 | `app/schedule/ScheduleClient.tsx`, `app/dashboard/page.tsx` | Manual: QA-V2-030 |
| REQ-M-102 | US-M-110 | `lib/actions/bookings.ts:bookClass` | Manual: QA-V2-030 |
| REQ-M-103 | US-M-111 | `lib/actions/bookings.ts:bookClass` | Manual: QA-V2-030 |
| REQ-M-104 | US-M-110 | `lib/actions/bookings.ts:bookClass`, `prisma/schema.prisma:CreditLedgerEntry` | Manual: QA-V2-040 |
| REQ-M-105 | US-M-120 | `lib/actions/bookings.ts:cancelBooking` | Manual: QA-V2-040 |
| REQ-A-101 | US-A-101 | `lib/actions/membership.ts:sellPlanAtCounter`, `app/admin/members/[id]/page.tsx` | Manual: QA-V2-020, QA-V2-021 |
| REQ-A-102 | US-A-102 | `app/admin/members/page.tsx`, `app/admin/members/[id]/page.tsx` | Manual: QA-V2-021 |
| REQ-A-103 | US-AD-101 | `lib/actions/membership.ts:adjustMemberCredits` | Manual: QA-V2-060 |
| REQ-P-101 | US-AD-110 | `lib/actions/membership.ts:createPlan`, `app/admin/plans/page.tsx` | Manual: QA-V2-010 |
| REQ-P-102 | US-AD-110 | `lib/actions/membership.ts:setPlanActive`, `app/admin/plans/page.tsx` | Manual: QA-V2-010 |
| REQ-R-101 | US-M-110 | `lib/actions/bookings.ts:promoteFromWaitlist` | Manual: QA-V2-050 |
| REQ-R-102 | US-A-101 | `lib/actions/admin.ts:promoteFromWaitlistAdmin`, `lib/actions/admin.ts:overrideCapacity` | Manual: QA-V2-060 |
| REQ-U-101 | US-U-101 | `lib/audit.ts`, `prisma/schema.prisma:AuditLog` | Manual: QA-V2-070 |
